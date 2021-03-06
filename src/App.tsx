import React, { useEffect, useState, useCallback, useRef } from 'react';
import data from './data.json';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import './App.scss';

const useEnhancedEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

function useEventCallback(fn: Function, dependencies: Array<any> = []) {
  const ref = useRef<Function>(() => {});

  useEnhancedEffect(() => {
    ref.current = fn;
  }, [fn, ...dependencies]);

  return useCallback(
    (...args: any[]) => {
      const fn = ref.current;
      return fn(...args);
    },
    [ref]
  );
}

const widthMaxLimit = 3840;
const heightMaxLimit = 2160;
const widthMinLimit = 800;
const heightMinLimit = 600;

const screenScaleRate = 0.6;
const screenHeight = window.innerHeight * screenScaleRate;
const screenWidth = ((window.innerHeight * screenScaleRate) / 9) * 16;

const useSupportRate = (
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  const [supportRate, setSupportRate] = useState(0);

  useEffect(() => {
    setSupportRate(
      (data.reduce((amount, screen) => {
        if (
          screen.width >= minWidth &&
          screen.height >= minHeight &&
          screen.width <= maxWidth &&
          screen.height <= maxHeight
        ) {
          return amount + screen.ratio;
        }
        return amount;
      }, 0) *
        100) /
        data.reduce((amount, screen) => {
          return amount + screen.ratio;
        }, 0)
    );
  }, [minWidth, minHeight, maxWidth, maxHeight]);
  return supportRate;
};
function App() {
  const [minWidth, setMinWidth] = useState(1280);
  const [minHeight, setMinHeight] = useState(720);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);

  const [minInputWidth, setMinInputWidth] = useState(minWidth);
  const [minInputHeight, setMinInputHeight] = useState(minHeight);
  const [maxInputWidth, setMaxInputWidth] = useState(maxWidth);
  const [maxInputHeight, setMaxInputHeight] = useState(maxHeight);

  useEffect(() => {
    setMinInputWidth(minWidth);
    setMinInputHeight(minHeight);
    setMaxInputWidth(maxWidth);
    setMaxInputHeight(maxHeight);
  }, [minWidth, minHeight, maxWidth, maxHeight]);

  const screenRef = useRef<HTMLDivElement>(null);
  const supportRate = useSupportRate(minWidth, minHeight, maxWidth, maxHeight);

  const realMinWidth = screenWidth * (minWidth / widthMaxLimit);
  const realMinHeight = screenHeight * (minHeight / heightMaxLimit);
  const realMaxWidth = screenWidth * (maxWidth / widthMaxLimit);
  const realMaxHeight = screenHeight * (maxHeight / heightMaxLimit);
  // console.log(data);
  const textFieldProps = {
    sx: { m: 1, width: '25ch' },
    InputProps: {
      endAdornment: <InputAdornment position="end">px</InputAdornment>,
    },
  };
  const [isScaling, setIsScaling] = useState(false);
  const [scalingPlace, setScalingPlace] = useState(0);
  const [scalingIsInner, setScalingIsInner] = useState(true);
  const [startPoint, setStartPoint] = useState([0, 0]);
  const [startSqrt, setStartSqrt] = useState([0, 0]);
  const [startOriginPoint, setStartOriginPoint] = useState([0, 0]);
  const handleScaleStart = useEventCallback(
    (e: MouseEvent, place: number, isInner: boolean) => {
      setScalingPlace(place);
      setScalingIsInner(isInner);
      setStartPoint([e.clientX, e.clientY]);
      setStartOriginPoint([
        screenRef.current?.offsetLeft || 0,
        screenRef.current?.offsetTop || 0,
      ]);
      setStartSqrt(
        isInner ? [realMinWidth, realMinHeight] : [realMaxWidth, realMaxHeight]
      );
      setIsScaling(true);
    },
    []
  );
  const handleScaleMoving = useEventCallback(
    (e: MouseEvent) => {
      if (!isScaling) return;
      let [originWidth, originHeight] = startSqrt;

      const centerPoint = [
        startOriginPoint[0] + screenWidth / 2,
        startOriginPoint[1] + screenHeight / 2,
      ];
      const currentLength = Math.sqrt(
        (e.clientX - centerPoint[0]) * (e.clientX - centerPoint[0]) +
          (e.clientY - centerPoint[1]) * (e.clientY - centerPoint[1])
      );
      const originLength = Math.sqrt(
        (startPoint[0] - centerPoint[0]) * (startPoint[0] - centerPoint[0]) +
          (startPoint[1] - centerPoint[1]) * (startPoint[1] - centerPoint[1])
      );
      const rate = currentLength / originLength;
      const newWidth = Math.floor(
        ((originWidth * rate) / screenWidth) * widthMaxLimit
      );
      const newHeight = Math.floor(
        ((originHeight * rate) / screenHeight) * heightMaxLimit
      );

      if (scalingIsInner) {
        if (![1, 7].includes(scalingPlace)) {
          setMinWidth(Math.min(Math.max(newWidth, widthMinLimit), maxWidth));
        }
        if (![3, 5].includes(scalingPlace)) {
          setMinHeight(
            Math.min(Math.max(newHeight, heightMinLimit), maxHeight)
          );
        }
      } else {
        if (![1, 7].includes(scalingPlace)) {
          setMaxWidth(Math.max(Math.min(newWidth, widthMaxLimit), minWidth));
        }
        if (![3, 5].includes(scalingPlace)) {
          setMaxHeight(
            Math.max(Math.min(newHeight, heightMaxLimit), minHeight)
          );
        }
      }
    },
    [
      isScaling,
      scalingPlace,
      scalingIsInner,
      startPoint,
      startOriginPoint,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      setMinWidth,
      setMinHeight,
      setMaxWidth,
      setMaxHeight,
    ]
  );
  const handleScaleEnd = useEventCallback(() => {
    setIsScaling(false);
  }, []);

  return (
    <div
      className="App"
      onMouseMove={handleScaleMoving}
      onMouseUp={handleScaleEnd}
      onMouseLeave={handleScaleEnd}
    >
      <h1>PC????????????????????????</h1>
      {/* <FormControlLabel
        control={<Checkbox defaultChecked />}
        label="????????????????????????windows?????????"
      /> */}
      {/* <FormControlLabel
        control={<Checkbox defaultChecked />}
        label="??????????????????"
      /> */}
      <div className="inputs">
        <TextField
          label="??????????????????"
          value={minInputWidth}
          onChange={(e) => setMinInputWidth(Number(e.target.value))}
          onBlur={() => {
            const value = Math.max(
              Math.min(Number(minInputWidth), maxWidth),
              widthMinLimit
            );
            setMinWidth(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.max(
                Math.min(Number(minInputWidth), maxWidth),
                widthMinLimit
              );
              setMinWidth(value);
            }
          }}
          {...textFieldProps}
        />
        <TextField
          label="??????????????????"
          value={minInputHeight}
          onChange={(e) => setMinInputHeight(Number(e.target.value))}
          onBlur={() => {
            const value = Math.max(
              Math.min(Number(minInputHeight), maxHeight),
              heightMinLimit
            );
            setMinHeight(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.max(
                Math.min(Number(minInputHeight), maxHeight),
                heightMinLimit
              );
              setMinHeight(value);
            }
          }}
          {...textFieldProps}
        />
        <TextField
          label="??????????????????"
          value={maxInputWidth}
          onChange={(e) => setMaxInputWidth(Number(e.target.value))}
          onBlur={() => {
            const value = Math.min(
              Math.max(Number(maxInputWidth), minWidth),
              widthMaxLimit
            );
            setMaxInputWidth(value);
            setMaxWidth(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.min(
                Math.max(Number(maxInputWidth), minWidth),
                widthMaxLimit
              );
              setMaxInputWidth(value);
              setMaxWidth(value);
            }
          }}
          {...textFieldProps}
        />
        <TextField
          label="??????????????????"
          value={maxInputHeight}
          onChange={(e) => setMaxInputHeight(Number(e.target.value))}
          onBlur={() => {
            const value = Math.min(
              Math.max(Number(maxInputHeight), minHeight),
              heightMaxLimit
            );
            setMaxInputHeight(value);
            setMaxHeight(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.min(
                Math.max(Number(maxInputHeight), minHeight),
                heightMaxLimit
              );
              setMaxInputHeight(value);
              setMaxHeight(value);
            }
          }}
          {...textFieldProps}
        />
      </div>
      <div
        className="screen"
        ref={screenRef}
        style={{ height: screenHeight, width: screenWidth }}
      >
        <div className="pixel-tip">
          {widthMaxLimit}x{heightMaxLimit}
        </div>
        <div
          className="screen-max"
          style={{ height: realMaxHeight, width: realMaxWidth }}
        >
          <div className="pixel-tip">
            ????????????????????????{maxWidth}x{maxHeight}
          </div>
        </div>
        <div
          className="screen-action-max"
          style={{ height: realMaxHeight, width: realMaxWidth }}
        >
          {new Array(9).fill(0).map((_, i) => (
            <div
              key={i}
              className="screen-action-max__button"
              onMouseDown={(e) => handleScaleStart(e, i, false)}
              style={{
                height:
                  Math.floor(i / 3) === 1
                    ? realMinHeight / 3
                    : (realMaxHeight - realMinHeight / 3) / 2,
                width:
                  i % 3 === 1
                    ? realMinWidth / 3
                    : (realMaxWidth - realMinWidth / 3) / 2,
              }}
            ></div>
          ))}
        </div>
        <div
          className="screen-min"
          style={{ height: realMinHeight, width: realMinWidth }}
        >
          <div className="pixel-tip">
            ????????????????????????{minWidth}x{minHeight}
          </div>
        </div>
        <div
          className="screen-action-min"
          style={{ height: realMinHeight, width: realMinWidth }}
        >
          {new Array(9).fill(0).map((_, i) => (
            <div
              key={i}
              className="screen-action-min__button"
              onMouseDown={(e) => handleScaleStart(e, i, true)}
              style={{
                height: realMinHeight / 3,
                width: realMinWidth / 3,
              }}
            ></div>
          ))}
        </div>
        <div className="support-rate">
          ????????????{supportRate > 100 ? 100 : supportRate.toFixed(2)}%
        </div>
      </div>
      <div className="tips">
        <h4>??????:</h4>
        <p>
          1.????????????????????????windows?????????????????????100px???????????????????????????????????????????????????16:9??????????????????????????????????????????!
        </p>
        <p>
          2.???????????????
          <a href="https://cn.screenresolution.org/year-2022/">
            https://cn.screenresolution.org/year-2022/
          </a>
          ???????????????????????????????????????????????????????????????
        </p>
      </div>
    </div>
  );
}

export default App;
