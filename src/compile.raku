

sub getTypeParams($type, $must_be_at_start) {

  if $must_be_at_start and not $type.starts-with('<') {
    return ('', '');
  }

  my @params = [''];
  my $depth = 0;

  my @chars = $type.split('')[1..*-1];
  for @chars.kv -> $idx, $char {
    my $ignore_angles = ($idx > 0 and @chars[$idx - 1] eq '='); # ignore the '>' in fat arrows

    if $char eq '>' and not $ignore_angles {
      $depth--;
      last if $depth == 0;  # stop after one <block>
    }

    if $depth == 1 and $char eq ',' {
      @params[*-1] .= trim;
      @params.push('');
    } elsif $depth > 0 {
      @params[*-1] ~= $char
    }

    $depth++ if $char eq '<' and not $ignore_angles;
  }

  @params = @params.map({ .trim }).grep({ $_ ne '' });

  return ('', '') if @params.elems == 0;

  my $with_constraints = "<" ~ @params.join(", ") ~ ">";
  my $without_constraints =
    "<" ~ @params.map({ .substr(0, $_.index(' ') || *) } ).join(", ")  ~ ">";

  return ($with_constraints, $without_constraints);
}

sub compile {

  my @type_chunks = [];
  my @docn_chunks = [];
  my @impl_chunks = [];
  my @test_chunks = [];

  my @patches = dir('./patches')
    .grep({ .ends-with(".patch") })
    .map(&parse_patch)
    .sort({ .<host>, .<syms>[0] });

  my @all_syms = @patches.flatmap({ .<syms>.Array }).unique;

  for @patches -> %patch {

    # constrainted/unconstrained type parameters of method
    (%patch<m_tparam_c>, %patch<m_tparam_uc>) = getTypeParams(%patch<type>, True);

    # constrainted/unconstrained type parameters of host
    (%patch<h_tparam_c>, %patch<h_tparam_uc>) = getTypeParams(%patch<host>, False);

    # combined contrainted type paramters of both host and method type
    %patch<c_tparam_c> = (%patch<m_tparam_c> and %patch<h_tparam_c>)
      ?? (%patch<h_tparam_c>.substr(0, *-1) ~ ', ' ~ %patch<m_tparam_c>.substr(1, *))
      !! (%patch<h_tparam_c> ~ %patch<m_tparam_c>);

    # strip type variables from <host> and <type>
    %patch<type> = %patch<type>.substr(%patch<m_tparam_c>.chars);
    %patch<host> = %patch<host>.flip.substr(%patch<h_tparam_c>.chars).flip;

  }

  # typescript symbol declarations
  for @all_syms -> $sym {
    @type_chunks.push("declare const SYM_$sym: unique symbol;");
  }
  @type_chunks.push("");

  # typescript W declarations
  @type_chunks.push('export declare const W: {');
  for @all_syms -> $sym {
    @type_chunks.push("  $sym: typeof SYM_$sym;");
  }
  @type_chunks.push("}\n");

  # typscript bound declarations
  @type_chunks.push('declare global {');
  for @patches -> %patch {
    for %patch<syms>.Array -> $sym {
      @type_chunks.push("  export interface %patch<host>%patch<h_tparam_c> \{ [SYM_$sym]: %patch<m_tparam_c>%patch<type>; \}");
    }
  }
  @type_chunks.push("}\n");

  # typescript unbound declarations
  for @patches -> %patch {
    for %patch<syms>.Array -> $sym {
      @type_chunks.push("interface __Unbound \{ $sym%patch<c_tparam_c>\(\n  thisArg: __Default\<%patch<host>%patch<h_tparam_uc>, ThisParameterType\<%patch<type>>>,\n  ...args: Parameters\<%patch<type>>\n  ): ReturnType\<%patch<type>>; }");
      @type_chunks.push("");
    }
  }
  @type_chunks.push("");

  # javascript symbol definitions
  for @all_syms -> $sym {
    @impl_chunks.push("__symbol('$sym');");
  }
  @impl_chunks.push("");

  # per-patch compilation
  for @patches.kv -> $idx, %patch {

    my $host_change = ($idx > 0 and @patches[$idx - 1]<host> ne %patch<host>);
    my $name = %patch<syms>[0];
    my @aliases = %patch<syms>.tail(*-1);

    # compile documentation
    @docn_chunks.push('***') if $host_change;
    @docn_chunks.push("### `%patch<host>#[" ~ %patch<syms>.join(', ') ~"]`");
    @docn_chunks.push("- type: `%patch<host>%patch<h_tparam_c>\[$name]: %patch<m_tparam_c>%patch<type>`");
    @docn_chunks.push(%patch<docn>);

    # compile implementation
    my $syms_as_js = '"' ~ %patch<syms>.join(" ") ~ '"';
    @impl_chunks.push("__patch(%patch<host>, $syms_as_js, %patch<impl>);");
    @impl_chunks.push("");

    # compile test
    if %patch<test>.trim eq '' {
      note "Warning: patch %patch<file> has no tests";
    } else {
      my $header = %patch<test>.contains('it(') ?? 'describe' !! 'it';
      my $async = <await async Promise>.grep({ %patch<test>.contains($_) }) ?? ' async' !! '';
      my $marked = %patch<test>.split("\n").map({ "/* %patch<host>#\[$name] */ $_" }).join("\n").indent(2);
      @test_chunks.push("$header\('supports %patch<host>#\[$name]',$async () => \{\n$marked\n\});\n".indent(2));
    }
  }

  # write to file

  my $out_dir = "../compiled";
  mkdir($out_dir);

  fill_stub('./README.stub.md'       , '..', @docn_chunks.join("\n\n"));
  fill_stub('./wrongish.stub.js'     , $out_dir, @impl_chunks.join("\n"));
  fill_stub('./wrongish.stub.test.ts', $out_dir, @test_chunks.join("\n"));
  fill_stub('./wrongish.stub.d.ts'   , $out_dir, @type_chunks.join("\n"));

  print("Done\n");

}

sub fill_stub($stub_file, $out_dir, *@patches) {
  my @lines = $stub_file.IO.slurp.split("\n");

  my @entrypoints = @lines.grep({ .contains('%ENTRY') }, :k);
  if @entrypoints.elems != @patches.elems {
    die "Stub $stub_file has " ~ @entrypoints.elems ~ " entrypoint(s) but " ~ @patches.elems ~ " patches were provided." }

  my $patched = @lines.kv.map(-> $i, $line { $i eq any(@entrypoints) ?? @patches[@entrypoints.first($i, :k)] !! $line }).join("\n");

  my $out_file = IO::Path.new($out_dir).add($stub_file.subst(/\.stub/, '')).cleanup;
  my $fh = $out_file.open(:w);
  $fh.print($patched);
  $fh.close;
}

sub parse_patch($file) {
  print("Processing $file\n");
  my @lines = $file.IO.slurp.split("\n");
  @lines.push(["::"]);

  my %patch =
    file => $file,
    # host type w/ type variable
    host => get_inline(@lines, "::host"),
    # method type w/ type variables
    type => get_inline(@lines, "::type"),
    # method symbols
    syms => get_inline(@lines, "::syms").words,
    # patch documentation
    docn => get_multiline(@lines, "::docn", "::"),
    # patch implementation
    impl => get_multiline(@lines, "::impl", "::"),
    # patch test
    test => get_multiline(@lines, "::test", "::");

  return %patch;
}

sub get_inline(@lines, Str $key, $default?) {
  my $line =  @lines.first({ .starts-with($key) });
  without $line {
    without $default { die "No key $key" }
    return $default
  }
  return $line.substr($key.chars, *).trim;
}

sub get_multiline(@lines, Str $key, Str $after) {
  my $from = 1 + (@lines.first({ .starts-with($key) }, :k) or die "No key $key");
  my $to = $from + -1 + @lines[$from..*].first({ .starts-with($after) }, :k);
  my @lns = @lines[$from..$to];
  @lns.shift while (@lns and @lns.head.trim eq '');
  @lns.pop while (@lns and @lns.tail.trim eq '');
  return @lns.join("\n");
}

compile;
