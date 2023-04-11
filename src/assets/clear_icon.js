import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function ClearIcon(props) {
  return (
    <Svg
      xmlns='http://www.w3.org/2000/svg'
      width={props?.width || 800}
      height={props?.height || 800}
      viewBox='0 0 16 16'
      {...props}
    >
      <Path
        d='M14.6 2.5H4.49a1.25 1.25 0 0 0-1 .51L.39 7.26a1.26 1.26 0 0 0 0 1.48L3.48 13a1.26 1.26 0 0 0 1 .51H14.6a1.25 1.25 0 0 0 1.25-1.25V3.75A1.25 1.25 0 0 0 14.6 2.5zm0 9.75H4.49L1.4 8l3.09-4.25H14.6z'
        style={{
          fill: '#111918',
        }}
      />
      <Path
        d='m7.86 10.55 1.99-1.72 1.99 1.72.82-.94L10.81 8l1.85-1.61-.82-.94-1.99 1.72-1.99-1.72-.82.94L8.9 8 7.04 9.61l.82.94z'
        style={{
          fill: '#111918',
        }}
      />
    </Svg>
  );
}
