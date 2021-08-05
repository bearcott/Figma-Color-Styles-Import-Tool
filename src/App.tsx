import styled from "@emotion/styled";
import * as React from "react";
import { MessageTypes } from "./helpers";

export const App = () => {
  const [apiUrl, setApi] = React.useState("");
  const [textbox, setTextbox] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [missingColors, setMissingColors] = React.useState([]);

  let debounce = null;

  React.useEffect(() => {
    // fetchData();
    onmessage = (e) => {
      const msg = e.data.pluginMessage;
      console.log(msg);
      switch (msg.type) {
        case MessageTypes.Error: {
          setErrorMsg(msg.message);
          return;
        }
        case MessageTypes.MissingColors: {
          setMissingColors([...msg.colors]);
          return;
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
              fetchData(apiUrl);
            }, 500);
            setApi(e.target.value);
          }}
          placeholder="http://test.com/colors.json"
        />
        <button
          className="refetch"
          onClick={() => {
            fetchData(apiUrl);
          }}
        >
          Refetch
        </button>
      </ApiContainer>
      <textarea
        value={textbox}
        placeholder="JSON or object here..."
        onChange={(e) => {
          console.log(typeof e.target.value);
          setTextbox(e.target.value);
        }}
      />
      <button
        className="create"
        onClick={() => {
          parent.postMessage(
            {
              pluginMessage: { type: MessageTypes.InputColors, code: textbox },
            },
            "*"
          );
        }}
      >
        Create
      </button>
      {errorMsg && <p className="error">{errorMsg}</p>}
      {missingColors.length > 0 && (
        <p className="error">
          <b>codebase missing {missingColors.length} colors:</b>
          <ul>
            {missingColors.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </p>
      )}
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
    padding: 10px;
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
