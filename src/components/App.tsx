import React from 'react';
import { Stack, TextField, ITextProps, Text, mergeStyleSets, css } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';

import * as babel from '@babel/core';
const Babel = require<BabelStandalone>('@babel/standalone');

interface BabelStandalone {
  transform(code: string, opts?: babel.TransformOptions): babel.BabelFileResult | null;
  registerPlugin(name: string, plugin: babel.PluginItem): void;
  registerPlugins(plugins: { [name: string]: babel.PluginItem }): void;
  registerPreset(name: string, preset: babel.PluginItem): void;
  registerPresets(presets: { [name: string]: babel.PluginItem }): void;

  availablePlugins: { [name: string]: babel.PluginItem };
  availablePresets: { [name: string]: babel.PluginItem };
}

// Babel.registerPlugin('transform-typescript', [
//   Babel.availablePlugins['transform-typescript']!,
//   { isTSX: true, allExtensions: true }
// ]);

const options: babel.TransformOptions = {
  // fake filename to satisfy certain plugins
  filename: 'root.tsx',
  presets: ['typescript', 'react', 'es2015'],
  // Preset setup attempts that didn't work
  // ['typescript', { isTSX: true, allExtensions: true }]
  // ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
  plugins: ['proposal-class-properties', 'proposal-object-rest-spread'],
  parserOpts: {
    strictMode: true
  }
};

const classNames = mergeStyleSets({
  root: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '50px 0'
  },
  header: {
    display: 'block',
    marginBottom: 10,
    color: NeutralColors.gray130,
    fontWeight: 'bold'
  },
  code: {
    maxHeight: 500,
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: '1.5'
  },
  errors: {
    color: 'red'
  },
  output: {
    border: '1px dashed gray',
    padding: 10
  }
});

const Header: React.FunctionComponent<ITextProps> = props => (
  <Text variant="xLarge" as="h2" className={classNames.header} {...props}>
    {props.children}
  </Text>
);

interface IAppState {
  code: string;
  error?: string;
}

const initialCode = `const text: string = "hello world";
ReactDOM.render(<div>{text}</div>, document.getElementById('output'));
`;

export class App extends React.Component<{}, IAppState> {
  public state: IAppState = {
    code: ''
  };
  private _timeout: number | undefined;

  public componentDidMount() {
    this._compile(initialCode);
  }

  public componentDidUpdate(prevProps: {}, prevState: IAppState) {
    if (prevState.code !== this.state.code) {
      this._evalCode();
    }
  }

  public render() {
    return (
      <Stack className={classNames.root} gap={20}>
        <Header as="h1" variant="xxLarge" style={{ textAlign: 'center' }}>
          TypeScript+React Editor
        </Header>
        <div>
          <Header>Code</Header>
          <TextField
            multiline
            autoAdjustHeight
            defaultValue={initialCode}
            onChange={this._onChange}
            styles={{ field: classNames.code }}
          />
        </div>
        {this.state.error && (
          <div>
            <Header>Errors</Header>
            <pre className={css(classNames.code, classNames.errors)}>{this.state.error}</pre>
          </div>
        )}
        <div>
          <Header>React results</Header>
          <div id="output" className={classNames.output} />
        </div>
        <div>
          <Header>Transformed code</Header>
          <pre className={classNames.code}>{this.state.code}</pre>
        </div>
      </Stack>
    );
  }

  private _evalCode() {
    try {
      eval(this.state.code);
      this.setState({ error: undefined });
    } catch (ex) {
      this.setState({ error: ex.message });
    }
  }

  private _compile(code: string) {
    try {
      this.setState({
        code: Babel.transform(code, options)!.code!,
        error: undefined
      });
    } catch (ex) {
      this.setState({
        error: ex.message
      });
    }
  }

  private _onChange = (ev: any, newValue?: string) => {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      this._compile(newValue || '');
    }, 1500) as any;
  };
}
