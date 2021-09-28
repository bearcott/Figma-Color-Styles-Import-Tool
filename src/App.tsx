import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import * as React from "react";
import { copyTextToClipboard, MessageTypes } from "./helpers";

export const App = () => {
  const [apiUrl, setApi] = React.useState("");
  const [textbox, setTextbox] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [infoMsg, setInfoMsg] = React.useState("");
  const [copied, setCopied] = React.useState(false);
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
    onmessage = async (e) => {
      const msg = e.data.pluginMessage;
      setErrorMsg("");
      setInfoMsg("");
      setMissingColors([]);
      setCopied(false);
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
        case MessageTypes.CopyText: {
          await copyTextToClipboard(msg.text);
          setCopied(true);
          startAnimation();
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
      <h1>Figma Styles JSON Tool</h1>

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
          className="secondary refetch"
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
        className="primary import"
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
        Import Colors
      </button>
      <button
        className="secondary export"
        onClick={() => {
          parent.postMessage(
            {
              pluginMessage: {
                type: MessageTypes.OutputColors,
              },
            },
            "*"
          );
        }}
      >
        🎨 Copy Local Color Styles
      </button>
      <button
        className="secondary export"
        onClick={() => {
          parent.postMessage(
            {
              pluginMessage: {
                type: MessageTypes.OutputTextStyles,
              },
            },
            "*"
          );
        }}
      >
        🖌 Copy Local Text Styles
      </button>
      {errorMsg && (
        <p className={`error ${shouldAnimate && "animate"}`}>❌ {errorMsg}</p>
      )}
      {infoMsg && (
        <p className={`info ${shouldAnimate && "animate"}`}>{infoMsg}</p>
      )}
      {copied && (
        <p className={`info ${shouldAnimate && "animate"}`}>✅ Copied!</p>
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

const Response = styled.div`
  padding: 10px;
  border: 1px solid #ececec;
  border-radius: 4px;
  margin-top: 10px;
`;

const Wrapper = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  overflow-x: hidden;

  h1 {
    font-size: 20px;
    color: #333;
    margin: 0;
    margin-bottom: 20px;
  }

  input,
  textarea,
  button,
  .error {
    color: #333;
    border-radius: 4px;
    transition: background 0.2s ease;
    border: none;
  }

  input,
  textarea {
    background: #f7f7f7;
    padding: 10px;
    margin-bottom: 10px;
    width: 100%;
    &:focus {
      outline: none;
      background: #f2f2f2;
    }
    &:hover {
      background: #f2f2f2;
    }
  }
  textarea {
    color: #b4b4b4;
    resize: vertical;
    min-height: 100px;
  }

  button {
    border-radius: 4px;
    padding: 10px 20px;
    margin-right: 10px;
    width: 100%;
    font-weight: bold;
  }

  .export {
    margin-top: 10px;
  }

  .error,
  .info {
    text-align: center;
  }
  .error {
    color: #ff5959;
  }
  .info {
    color: #888;
  }
  .animate {
    animation: ${fadeOut} 0.2s forwards;
  }

  button.primary {
    background: #4a9ff4;
    color: #d1e8ff;
    &:hover {
      cursor: pointer;
      background: #66b2ff;
    }
  }
  button.secondary {
    /* border: 1px solid #ececec; */
    background: #d1e8ff;
    color: #4a9ff4;
    &:hover {
      cursor: pointer;
      background: #c1dffd;
    }
  }
`;

const ApiContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  input,
  button {
    margin: 0;
  }
  button.refetch {
    padding: 0 20px;
    margin: 0;
    margin-left: 10px;
    width: auto;
  }
  align-items: stretch;
`;
