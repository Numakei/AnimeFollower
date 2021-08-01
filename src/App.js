import * as d3 from "d3";
import { useEffect, useState } from "react";
import "bulma/css/bulma.css";
import { stackOrderNone } from "d3";

function VerticalAxis({ scale }) {
  const x = 0;
  const [y1, y2] = scale.range();
  const strokeColor = "#888";
  const height = 700;
  return (
    <g>
      {/* <line x1={x} y1={y1} x2={x} y2={y2} stroke={strokeColor} /> */}
      {/* <g transform="rotate(90)">
        <text x="300" y="43" fontSize="12" textAnchor="middle">
          ランキング
        </text>
      </g> */}
      <g>
        {scale.ticks().map((y) => {
          return (
            <g transform={`translate(0,${height - scale(y)})`}>
              {/* <line x1="0" y1="0" x2="-5" y2="0" stroke={strokeColor} /> */}
              <text
                x="-8"
                textAnchor="end"
                dominantBaseline="central"
                fontSize="25"
                fontWeight="bold"
              >
                {y}位
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}

function HorizontalAxis({ scale }) {
  const y = 700;
  const strokeColor = "#888";
  const date = ["12/1", "1/5", "2/2", "3/2", "4/6", "5/11", "6/8"];
  return (
    <g>
      {/* <line x1="0" y1={y} x2="700" y2={y} stroke={strokeColor} /> */}
      {/* <text x="345" y={y + 35} fontSize="12" textAnchor="middle">
        日付
      </text> */}
      <g>
        {scale.map((x) => {
          return (
            <g transform={`translate(${(y / scale.length) * Number(x)}, 0)`}>
              {/* <line x1="0" y1={y + 5} x2="0" y2={y} stroke={strokeColor} /> */}
              <text
                y={y - 730}
                textAnchor="middle"
                dominantBassline="hanging"
                fontSize="12"
                fontWeight="bold"
              >
                {date[x - 1]}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}

function Legends({ scale }) {
  console.log(scale.domain());

  return (
    <g>
      {scale.domain().map((item, i) => {
        return (
          <g key={i} transform={`translate(800, ${20 + i * 15})`}>
            <circle r="5" fill={scale(item)} />
            <text x="10" fontSize="13" dominantBaseline="central">
              {item}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function App() {
  const margin = {
    top: 70,
    bottom: 40,
    left: 100,
    right: 400,
  };

  const contentWidth = 700;
  const contentHeight = 700;

  const [data, setData] = useState([]);

  const [followerCnt, setFollowerCnt] = useState(undefined);
  const [pointer, setPointer] = useState([]);
  const [color, setColor] = useState(undefined);
  const [judge, setJudge] = useState([]);

  const mouseOver = (event, follower, itemColor, title, month) => {
    setPointer([event.pageX, event.pageY]);
    setFollowerCnt(follower);
    setColor(itemColor);
    setJudge([title, month]);
  };

  const mouseLeave = () => {
    setFollowerCnt(undefined);
    setJudge([]);
  };

  useEffect(() => {
    (async () => {
      const request = await fetch("anime.json");
      const data = await request.json();
      setData(data);
    })();
  }, []);

  const property = [
    "rank1",
    "rank2",
    "rank3",
    "rank4",
    "rank5",
    "rank6",
    "rank7",
  ];

  const xScale = property.map((data) => data.slice(4));
  console.log(xScale);

  const yScale = d3
    .scaleLinear()
    .domain([1, 10])
    .range([contentHeight, 0])
    .nice();
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const svgWidth = margin.left + margin.right + contentWidth;
  const svgHeight = margin.top + margin.bottom + contentHeight;

  return (
    <div>
      <section className="hero is-small is-success">
        <header className="hero-body">
          <p class="title">
            2021年1月期 アニメ番組フォロワー数ランキング変遷 TOP10
          </p>
        </header>
      </section>
      <main>
        <div className="graph">
          <svg
            viewBox={`${-margin.left} ${-margin.top} ${svgWidth} ${svgHeight}`}
          >
            <VerticalAxis scale={yScale} />
            <HorizontalAxis scale={xScale} />
            <Legends scale={colorScale} />
            <g>
              {data.map((item, i) => {
                return property.map((month, j) => {
                  const cy =
                    contentHeight -
                    yScale(
                      item["rank" + Math.max(parseInt(month.slice(4)) - 1, 1)]
                    );
                  return (
                    <g>
                      <circle
                        key={j}
                        cx={(contentWidth / 7) * (j + 1)}
                        cy={contentHeight - yScale(item[month])}
                        r={
                          judge[0] === item.title && judge[1] === month
                            ? "8"
                            : "6"
                        }
                        fill={colorScale(item.title)}
                        transitionduration="1s"
                        transitionproperty="all"
                        onMouseEnter={(event) =>
                          mouseOver(
                            event,
                            item["follower" + month.slice(4)],
                            colorScale(item.title),
                            item.title,
                            month
                          )
                        }
                      />
                      <line
                        x1={(contentWidth / 7) * Math.max(j, 1)}
                        x2={(contentWidth / 7) * (j + 1)}
                        y1={cy}
                        y2={contentHeight - yScale(item[month])}
                        stroke={colorScale(item.title)}
                      />
                    </g>
                  );
                });
              })}
            </g>
          </svg>
          {followerCnt !== undefined && (
            <div
              className="numberOfFollower"
              style={{
                position: "absolute",
                left: pointer[0] + 10,
                top: pointer[1] - 30,
                color: color,
                border: "0px solid",
                shadow: "0px 0px 0px 0px",
                fontSize: "15px",
                textAlign: "center",
                fontWeight: "bold",
              }}
              onMouseLeave={mouseLeave}
            >
              <div className="content">
                <p>フォロワー数</p>
                <p>{followerCnt}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
