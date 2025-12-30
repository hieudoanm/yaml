import { INITIAL_YAML } from '@yaml/constants/app';
import jsonSchemaGenerator from 'json-schema-generator';
import { NextPage } from 'next';
import { useMemo, useState } from 'react';
import { parse } from 'yaml';

// Using the modern Clipboard API
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
    alert('Copy to Clipboard');
  } catch (err) {
    console.error('Failed to copy!', err);
    alert('Failed to Copy to Clipboard');
  }
};

const HomePage: NextPage = () => {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', stored); // <-- set html here
      return stored;
    }
    return 'light';
  });

  const [{ yaml = INITIAL_YAML, schemaURL = '' }, setState] = useState<{
    yaml: string;
    schemaURL: string;
  }>({
    yaml: INITIAL_YAML,
    schemaURL: '',
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme); // <-- update html
    setTheme(newTheme);
  };

  const jsonResult = useMemo(() => {
    try {
      const jsonObject = parse(yaml);
      const jsonString: string = JSON.stringify(jsonObject, null, 2);
      const jsonSchema = jsonSchemaGenerator(jsonObject);
      if (schemaURL !== '') jsonSchema.$schema = schemaURL;
      const jsonSchemaString = JSON.stringify(jsonSchema, null, 2);
      return { jsonString, jsonSchemaString };
    } catch (error) {
      console.error(error);
      return { jsonString: 'Invalid YAML', jsonSchemaString: 'Invalid YAML' };
    }
  }, [yaml, schemaURL]);

  const { jsonString, jsonSchemaString } = jsonResult;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <nav className="border-base-300 border-b px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <span className="font-bold">YAML</span>
          <button className="btn btn-sm btn-primary" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </nav>
      <div className="divide-base-300 flex h-full grow flex-col divide-y">
        <div className="px-4 py-4 md:px-8">
          <input
            id="schema-url"
            name="schema-url"
            placeholder="Schema URL"
            className="input w-full focus:outline-none"
            value={schemaURL}
            onChange={(event) => {
              setState((previous) => ({
                ...previous,
                schemaURL: event.target.value,
              }));
            }}
          />
        </div>
        <div className="divide-base-300 grid h-full grid-cols-1 grid-rows-3 gap-y-4 divide-x overflow-hidden rounded-2xl px-4 py-4 md:grid-cols-3 md:grid-rows-1 md:gap-x-4 md:px-8">
          <div className="relative row-span-1 md:col-span-1">
            <button
              type="button"
              className="btn btn-sm absolute top-2 right-2 z-10"
              onClick={() => {
                copyToClipboard(yaml);
              }}>
              📋
            </button>
            <textarea
              id="yaml"
              name="yaml"
              placeholder="YAML"
              className="textarea h-full w-full focus:outline-none"
              value={yaml}
              onChange={(event) => {
                setState((previous) => ({
                  ...previous,
                  yaml: event.target.value,
                }));
              }}
            />
          </div>
          <div className="relative row-span-1 md:col-span-1">
            <button
              type="button"
              className="btn btn-sm absolute top-2 right-2 z-10"
              onClick={() => {
                copyToClipboard(jsonString);
              }}>
              📋
            </button>
            <textarea
              id="json"
              name="json"
              placeholder="JSON"
              className="textarea h-full w-full focus:outline-none"
              value={jsonString}
              readOnly
            />
          </div>
          <div className="relative row-span-1 md:col-span-1">
            <button
              type="button"
              className="btn btn-sm absolute top-2 right-2 z-10"
              onClick={() => {
                copyToClipboard(jsonSchemaString);
              }}>
              📋
            </button>
            <textarea
              id="json-schema"
              name="json-schema"
              placeholder="JSON Schema"
              className="textarea h-full w-full focus:outline-none"
              value={jsonSchemaString}
              readOnly
            />
          </div>
        </div>
      </div>
      <footer className="border-base-300 border-t px-4 py-4 md:px-8">
        <p className="text-center">&copy; YAML {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default HomePage;
