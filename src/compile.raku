

# https://github.com/microsoft/TypeScript/issues/2536#issuecomment-87194347
my @ts_keywords = <
  break case catch class const continue debugger default delete do else enum
  export extends false finally for function if import in instanceof new null
  return super switch this throw true try typeof var void while with as
  implements interface let package private protected public static yield
>;

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

  # typescript symbol declarations
  for @all_syms -> $sym {
    if @ts_keywords.contains($sym) {
      @type_chunks.push("export const \$$sym: unique symbol;  // typescript keyword");
    } else {
      @type_chunks.push("export const $sym: unique symbol; export const \$$sym: typeof $sym;");
    }
  }
  @type_chunks.push("");

  # javascript symbol definitions
  for @all_syms -> $sym {
    @impl_chunks.push("__symbol('$sym', __ex.$sym = __ex.\$$sym = Symbol('$sym'));");
  }
  @impl_chunks.push("");

  # per-patch compilation
  for @patches.kv -> $idx, %patch {

    my $host_change = ($idx > 0 and @patches[$idx - 1]<host> ne %patch<host>);
    my $name = %patch<syms>[0];
    my @aliases = %patch<syms>.tail(*-1);

    # compile documentation
    @docn_chunks.push('***') if $host_change;
    @docn_chunks.push("### `%patch<host>\[\$$name]`");
    if %patch<syms>.elems > 1 {
      my $aliases_str = @aliases.map({ "'\$$_'" }).join(", ");
      @docn_chunks.push("Aliases: $aliases_str \n");
    }
    @docn_chunks.push("Type: `%patch<host>%patch<hvar>\[\$$name]%patch<type>`");
    @docn_chunks.push(%patch<docn>);

    # compile implementation
    my $syms_as_js = '[' ~ %patch<syms>.map({ "'$_'" }).join(", ") ~ ']';
    @impl_chunks.push("__patch(%patch<host>, $syms_as_js, %patch<impl>);");
    @impl_chunks.push("");

    # compile typescript bits
    @type_chunks.push("") if $host_change;
    for %patch<syms>.Array -> $sym {
      @type_chunks.push("export interface %patch<host>%patch<hvar> \{ [\$$sym]%patch<type>; \}");
    }

    # compile test
    my $header = %patch<test>.contains('it(') ?? 'describe' !! 'it';
    @test_chunks.push("$header\('%patch<host>\[$name]', () => \{\n%patch<test>.indent(2)\n\});\n".indent(2));
    note "Warning: patch %patch<file> has no tests" if %patch<test>.trim eq '';
  }

  # write to file
  my $out_dir = "../compiled";
  mkdir($out_dir);
  fill_stub('./README.stub.md'       , '..', @docn_chunks.join("\n\n"));
  fill_stub('./wrongish.stub.js'     , $out_dir, @impl_chunks.join("\n"));
  fill_stub('./wrongish.stub.test.js', $out_dir, @test_chunks.join("\n"));
  fill_stub('./wrongish.stub.d.ts'   , $out_dir, @type_chunks.join("\n"));

  print("Done\n");
  
}

sub fill_stub($stub_file, $out_dir, $patch) {
  my @lines = $stub_file.IO.slurp.split("\n");
  
  my @entries = @lines.grep({ .contains('%ENTRY') }, :k);
  if @entries.elems != 1 { die "Stub $stub_file has non-one number of entrypoints." }
  my $entry = @entries[0];
  
  my $patched = @lines.kv.map(-> $i, $line { $i == $entry ?? $patch !! $line }).join("\n");

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
    # host type name
    host => get_inline(@lines, "::host"),
    # host type variable
    hvar => get_inline(@lines, "::hvar", ''),
    # method type
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
