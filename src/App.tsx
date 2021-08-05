import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import * as React from "react";
import { isJsonString, MessageTypes } from "./helpers";

export const App = () => {
  const [apiUrl, setApi] = React.useState("");
  const [textbox, setTextbox] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [infoMsg, setInfoMsg] = React.useState("");
  const [missingColors, setMissingColors] = React.useState([]);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  let debounce = null;

  const startAnimation = () => {
    setShouldAnimate(true);
    setTimeout(() => {
      setShouldAnimate(false);
    }, 500);
  };

  React.useEffect(() => {
    // fetchData();
    onmessage = (e) => {
      const msg = e.data.pluginMessage;
      switch (msg.type) {
        case MessageTypes.Info: {
          startAnimation();
          setInfoMsg(msg.message);
          setErrorMsg("");
          return;
        }
        case MessageTypes.Error: {
          startAnimation();
          setErrorMsg(msg.message);
          return;
        }
        case MessageTypes.MissingColors: {
          startAnimation();
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
      startAnimation();
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
          console.log(JSON.stringify(e.target.value));
          setTextbox(e.target.value);
        }}
      />
      <button
        className="create"
        onClick={() => {
          parent.postMessage(
            {
              pluginMessage: {
                type: MessageTypes.InputColors,
                code: textbox,
              },
            },
            "*"
          );
        }}
      >
        Create
      </button>
      {errorMsg && (
        <p className={`error ${shouldAnimate && "animate"}`}>{errorMsg}</p>
      )}
      {infoMsg && (
        <p className={`info ${shouldAnimate && "animate"}`}>{infoMsg}</p>
      )}
      {missingColors.length > 0 && (
        <p className={`error ${shouldAnimate && "animate"}`}>
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

const fadeOut = keyframes`
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const Wrapper = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  overflow-x: hidden;

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
    min-height: 100px;
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
  .info {
    padding: 10px;
    background: #dce5ff;
    color: #a5b5e2;
  }
  .animate {
    animation: ${fadeOut} 0.2s forwards;
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
