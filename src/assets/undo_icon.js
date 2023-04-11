import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function UndoIcon(props) {
  return (
    <Svg
      xmlns='http://www.w3.org/2000/svg'
      xmlSpace='preserve'
      width={props?.width || 800}
      height={props?.height || 800}
      viewBox='0 0 32 32'
      {...props}
    >
      <Path
        d='M29 18a12.92 12.92 0 0 1-3.808 9.193A12.917 12.917 0 0 1 16 31c-3.473 0-6.737-1.353-9.192-3.808S3 21.472 3 18a2 2 0 0 1 4 0c0 2.403.937 4.664 2.636 6.364A8.94 8.94 0 0 0 16 27a8.943 8.943 0 0 0 6.364-2.636C24.063 22.664 25 20.404 25 18s-.937-4.664-2.636-6.364A8.94 8.94 0 0 0 16 9h-2.172l1.586 1.586a2 2 0 1 1-2.828 2.828l-5-5a2 2 0 0 1 0-2.828l5-5a2 2 0 1 1 2.828 2.828L13.828 5H16c3.473 0 6.737 1.353 9.192 3.808A12.916 12.916 0 0 1 29 18z'
        style={{
          fill: '#111918',
        }}
      />
    </Svg>
  );
}
