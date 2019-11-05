import React from "react";
import styled from 'styled-components';
import { Text } from './UIKit'

export default { title: "DawnGradient" };

// #AF6146
// #BE9470
// #5F6781

// #5F6781,
// #5F6781,
// #5F6781,
// #5F6781,
// #9C8D8C,
// #BE9470,
// #CA7549,
// #AF6146

const Gradient1 = styled.div`
  background: linear-gradient(
    #5F6781 50%,
    #BE9470,
    #CA7549
  );
  width: 100%;
  height: 100%;
  min-width: 500px;
  min-height: 500px;
`;

// #FEFD98
// #FFC8B0
// #C797A2
// #21243F

const Gradient2 = styled.div`
  background: linear-gradient(
    #21243F,
    #C797A2 50%,
    #FFC8B0,
    #FEFD98
  );
  width: 100%;
  height: 100%;
  min-width: 500px;
  min-height: 500px;
`;

// #6B7381
// #D2AB80
// #FCA34C
// #D5653C
// #91543C

const Gradient3 = styled.div`
  background: linear-gradient(
    #6B7381 30%,
    #D2AB80,
    #FCA34C,
    #D5653C,
    #91543C
  );
  width: 100%;
  height: 100%;
  min-width: 500px;
  min-height: 500px;
`;

export const dawn1 = () => {
  return <Gradient1/>
};

export const dawn2 = () => {
  return <Gradient2/>
};

export const dawn3 = () => {
  return <Gradient3/>
};