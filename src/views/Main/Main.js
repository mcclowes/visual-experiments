import Moth from "../../components/Moth";
import React from "react";
import { Text } from "../../components/UIKit";

const colors = [
  "#333333",
  "#4C5F5F",
  "brown",
  "#91613f",
  "#a88d79",
  "#542705",
  "#4d2e2c",
  "#786e6d",
  "#5c5947"
];

const types = [
  "default",
  "alt1",
  "alt2",
  "alt3",
  "alt4",
  "alt5",
  "alt6",
  "alt7"
];

const randomItem = items => items[Math.floor(Math.random() * items.length)];

const Main = props => {
  return (
    <div
      style={{
        background: "#eee",
        padding: "1em",
        display: "grid",
        gridGap: "5px",
        grid: "auto-flow / 1fr 1fr 1fr 1fr 1fr"
      }}
    >
      {Array(60)
        .fill(0)
        .map((x, i) => {
          return i === 12 ? (
            <div style={{ textAlign: "center" }}>
              <Text.Header>Happy 60 moths!</Text.Header>
              <Text>
                I am drawn to you <br />
                like a moth to a flame,
                <br />
                and your smile
                <br />
                is my brightest light {"<3"}
              </Text>
            </div>
          ) : (
            <div
              style={{
                height: "150px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Moth type={randomItem(types)} color={randomItem(colors)} />
            </div>
          );
        })}
    </div>
  );
};

export default Main;
