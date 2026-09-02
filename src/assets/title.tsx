export const enum ETitle {
  Q = "Q",
  A = "A",
  N = "N",
  D = "D",
}

interface IProps {
  title: ETitle
  color: string
}

export default function Title({ title, color }: IProps) {
  return (
    <svg width="512" height="512" viewBox="0 0 512 512" className="aspect-square h-auto w-full">
      <defs>
        <clipPath id={`canvas-clip-${title}`}>
          <rect width="512" height="512" rx="112" ry="112" />
        </clipPath>
      </defs>
      <rect width="512" height="512" rx="112" ry="112" fill="none" clipPath={`url(#canvas-clip-${title})`} />
      <g transform="rotate(0, 256, 256)">
        <text
          x="266"
          y="256"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="266"
          y="259"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="264"
          y="262"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="262"
          y="264"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="260"
          y="265"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="257"
          y="266"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="254"
          y="266"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="251"
          y="265"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="249"
          y="263"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="247"
          y="260"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="246"
          y="257"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="246"
          y="255"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="247"
          y="252"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="249"
          y="249"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="251"
          y="247"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="254"
          y="246"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="257"
          y="246"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="260"
          y="247"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="262"
          y="248"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="264"
          y="250"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="266"
          y="253"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="263"
          y="256"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="262"
          y="259"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="261"
          y="261"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="258"
          y="263"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="255"
          y="263"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="253"
          y="262"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="250"
          y="260"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="249"
          y="257"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="249"
          y="255"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="250"
          y="252"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="252"
          y="250"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="255"
          y="249"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="258"
          y="249"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="261"
          y="251"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="262"
          y="253"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="259"
          y="256"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="259"
          y="257"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="258"
          y="259"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="256"
          y="259"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="255"
          y="259"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="253"
          y="257"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="253"
          y="256"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="253"
          y="254"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="254"
          y="253"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="256"
          y="253"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="258"
          y="253"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="259"
          y="254"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill="#111111"
        >
          {title}
        </text>
        <text
          x="256"
          y="256"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Poppins', sans-serif"
          font-weight="700"
          font-size="300"
          fill={color}
        >
          {title}
        </text>
      </g>
    </svg>
  )
}
