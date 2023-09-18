import React, { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import "./App.css";

const hightlightWithLineNumbers = (input, language) =>
  highlight(input, language)
    .split("\n")
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");

function App() {
  const [error, setError] = useState("");
  const [value, setValue] =
    useState(`0x2CB99F193549681e06C6770dDD5543812B4FaFE8 10
0xEb0D38c92deB969b689acA94D962A07515CC5204 5
0xF4aDE8368DDd835B70b625CF7E3E1Bc5791D18C1 6
0x09ae5A64465c18718a46b3aD946270BD3E5e6aaB 9
0x8B3392483BA26D65E331dB86D4F430E9B3814E5e 10`);

  const valueToArray = () => {
    if (value === "") return [];

    return value.split("\n").reduce((result, it, index) => {
      const item = it.split(/,| |=/);
      result.push({
        code: item[0],
        balance: item[1] ? parseInt(item[1]) : "",
        error: validateValue(item[1], index),
      });
      return result;
    }, []);
  };

  const validateValue = (value, index) => {
    return {
      index,
      error: !!isNaN(value) || value < 0,
    };
  };

  const getError = () => {
    const index = valueToArray()
      .filter((item) => item.error.error === true)
      .map((item) => parseInt(item.error.index) + 1);
    console.log(index);
    return (
      <div>
        {index.length > 0 ? (
          <div className="error">
            <div className="error-contents">
              <svg
                height="25"
                style={{
                  overflow: "visible",
                  enableBackground: "new 0 0 32 32",
                }}
                viewBox="0 0 32 32"
                width="25"
              >
                <g>
                  <g id="Error_1_">
                    <g id="Error">
                      <circle
                        cx="16"
                        cy="16"
                        id="BG"
                        r="16"
                        style={{
                          fill: "#D72828",
                        }}
                      />
                      <path
                        d="M14.5,25h3v-3h-3V25z M14.5,6v13h3V6H14.5z"
                        id="Exclamatory_x5F_Sign"
                        style={{ fill: "#fff" }}
                      />
                    </g>
                  </g>
                </g>
              </svg>
              <div className="item">Line {index.join(",")} wrong amount</div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const keepFirstOne = () => {
    const realData = valueToArray();
    const { arraywithputduplicate } = normalize();
    let result = [];

    arraywithputduplicate.forEach((item) => {
      if (item.value.length > 1) {
        const minIndex = Math.min(...item.value);
        const findData = realData.find((data) => data.error.index === minIndex);
        if (findData) {
          result.push([findData.code, findData.balance].join(" "));
        }
      } else {
        const findData = realData.find(
          (data) => data.error.index === item.value[0]
        );
        if (findData) {
          result.push([findData.code, findData.balance].join(" "));
        }
      }
    });
    setValue(result.join("\n"));
  };

  const combineBalance = () => {
    const realData = valueToArray();
    const { arraywithputduplicate } = normalize();
    let result = [];

    arraywithputduplicate.forEach((item) => {
      if (item.value.length > 1) {
        const totalBalance = realData
          .filter((data) => item.value.includes(data.error.index))
          .reduce((sum, it) => sum + it.balance, 0);
        result.push([item.code, totalBalance].join(" "));
      } else {
        const findData = realData.find(
          (data) => data.error.index === item.value[0]
        );
        if (findData) {
          result.push([findData.code, findData.balance].join(" "));
        }
      }
    });
    setValue(result.join("\n"));
  };

  const normalize = () => {
    const data = valueToArray();

    let duplicateKey = {};

    for (let key in data) {
      if (!duplicateKey[data[key].code]) {
        duplicateKey[data[key].code] = [data[key].error.index];
      } else {
        duplicateKey[data[key].code] = [
          ...duplicateKey[data[key].code],
          data[key].error.index,
        ];
      }
    }
    let arrayofduplicate = [];
    let arraywithputduplicate = [];

    Object.keys(duplicateKey).forEach(function (key) {
      arraywithputduplicate.push({ code: key, value: duplicateKey[key] });
      if (duplicateKey[key].length > 1) {
        arrayofduplicate.push({ code: key, value: duplicateKey[key] });
      }
    });

    return { arrayofduplicate, arraywithputduplicate };
  };

  const getDuplicateCode = () => {
    const { arrayofduplicate } = normalize();

    setError(
      <>
        {arrayofduplicate.length > 0 ? (
          <div>
            <table width={"100%"}>
              <tbody>
                <tr>
                  <td align="left" className="error-text">
                    Duplicate
                  </td>
                  <td align="right">
                    <div>
                      <button
                        className="error-button"
                        onClick={() => keepFirstOne()}
                      >
                        Keep the first one
                      </button>{" "}
                      |{" "}
                      <button
                        className="error-button"
                        onClick={() => combineBalance()}
                      >
                        Combine Balance
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} align="left" className="error">
                    {arrayofduplicate.map((item) => {
                      return (
                        <React.Fragment key={item.code}>
                          {item.value.length > 1 ? (
                            <div>
                              Address: {item.code} encountered duplicate at
                              line: {item.value.join(",")}
                            </div>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </>
    );
  };

  const validate = (code) => {
    let values = code.split("\n").reduce((result, it, index) => {
      const item = it.split(/,| |=/);
      result.push({
        code: item[0],
        value: item[1] ? parseInt(item[1]) : "",
        error: validateValue(item[1], index),
      });
      return result;
    }, []);
    return values;
  };

  const onChangeHandler = (code) => {
    setValue(code);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    getDuplicateCode();
  };

  return (
    <div className="App">
      <form onSubmit={onSubmitHandler}>
        <label className="label">Address with Amounts</label>
        <Editor
          highlight={(code) => hightlightWithLineNumbers(code, languages.js)}
          onValueChange={(code) => onChangeHandler(code)}
          onBlur={() => validate(value)}
          value={value}
          padding={10}
          textareaId="codeArea"
          className="editor"
          style={{
            fontSize: 18,
            outline: 0,
            height: 200,
          }}
        />
        <div className="label">Separated by ',' or '' or '='</div>
        {getError()}
        {error}
        <div className="button-container">
          <button type="submit" className="next-button">
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
