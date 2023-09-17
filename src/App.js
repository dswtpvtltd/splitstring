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
  const [value, setValue] = useState("");

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
      error: !!isNaN(value),
    };
  };

  const getError = () => {
    const index = valueToArray().findIndex((item) => item.error.error === true);

    return (
      <>
        {index > 0 ? (
          <div className="error">Line {index + 1} wrong amount</div>
        ) : null}
      </>
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

    return (
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
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} align="left" className="error">
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

  return (
    <div className="App">
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
      {getError()}
      {getDuplicateCode()}
    </div>
  );
}

export default App;
