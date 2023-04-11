import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function EqualsIcon(props) {
  return (
    <Svg
      xmlns='http://www.w3.org/2000/svg'
      width={props?.width || 800}
      height={props?.height || 800}
      aria-hidden='true'
      viewBox='0 0 14 14'
      {...props}
    >
      <Path
        d='M12.143 8.286H1.857A.857.857 0 0 0 1 9.143V10c0 .473.384.857.857.857h10.286A.857.857 0 0 0 13 10v-.857a.857.857 0 0 0-.857-.857zm0-5.143H1.857A.857.857 0 0 0 1 4v.857c0 .473.384.857.857.857h10.286A.857.857 0 0 0 13 4.857V4a.857.857 0 0 0-.857-.857z'
        style={{
          fill: '#111918',
        }}
      />
    </Svg>
  );
}
