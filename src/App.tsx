import styled from "@emotion/styled";
import * as React from "react";

export const App = () => {
  const DEFAULT_API_URL = "https://app.pipe-dev.com/api/colors";
  const [apiUrl, setApi] = React.useState("");
  const [textbox, setTextbox] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  let debounce = null;

  React.useEffect(() => {
    fetchData(DEFAULT_API_URL);

    // // this doesnt work
    onmessage = (e) => {
      switch (e.data.ype) {
        case "error": {
          setErrorMsg(e.data.message);
        }
      }
    };
  }, []);

  const fetchData = async (url) => {
    try {
      const rawData = await fetch(url);
      const data = await rawData.json();
      setTextbox(JSON.stringify(data));
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  return (
    <Wrapper>
      <h1>Code → Color Import Tool 🎨</h1>

      <ApiContainer>
        <input
          value={apiUrl}
          onChange={(e) => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
              fetchData(apiUrl || DEFAULT_API_URL);
            }, 500);
            setApi(e.target.value);
          }}
          placeholder="https://app.pipe-dev.com/api/colors"
        />
        <button
          className="refetch"
          onClick={() => {
            fetchData(apiUrl || DEFAULT_API_URL);
          }}
        >
          Refetch
        </button>
      </ApiContainer>
      <textarea
        value={textbox}
        onChange={(e) => {
          setTextbox(e.target.value);
        }}
      />
      <button
        className="create"
        onClick={() => {
          parent.postMessage(
            { pluginMessage: { type: "input-colors", code: textbox } },
            "*"
          );
        }}
      >
        Create
      </button>
      {errorMsg && <p className="error">{errorMsg}</p>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  h1 {
    font-size: 20px;
    color: #474a52;
    margin: 0;
    margin-bottom: 20px;
  }

  input,
  textarea,
  button,
  .error {
    color: #474a52;
    border-radius: 4px;
    transition: background 0.2s ease;
    border: none;
  }

  input,
  textarea {
    background: #ebf4f4;
    padding: 10px;
    margin-bottom: 10px;
    width: 100%;
    &:hover {
      background: #e2f2f6;
    }
  }
  textarea {
    color: #99acae;
    resize: vertical;
  }

  button {
    background: #a78fdb;
    color: #fff;
    border-radius: 4px;
    padding: 10px 20px;
    margin-right: 10px;
    width: 100%;
    font-weight: bold;
    &:hover {
      cursor: pointer;
      background: #b58fdb;
    }
  }

  .create {
    margin-top: 20px;
  }

  .error {
    background: #f3ddd1;
    color: #ad5252;
  }
`;

const ApiContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  input,
  button {
    margin: 0;
  }
  button {
    padding: 0 20px;
    margin: 0;
    margin-left: 10px;
    width: auto;
    background: #dacff2;
    color: #7a6a9d;
    &:hover {
      background: #e2cbff;
    }
  }
  align-items: stretch;
`;
