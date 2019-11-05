import imagetest from './imagetest.png';
import React from "react";
import styled from 'styled-components';
import { Text } from './UIKit'

export default { title: "Polka" };

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-width: 500px;
  min-height: 500px;
  position: relative;
  background-image: url(${imagetest});
  background-size: cover;
  overflow: hidden;
`

const OverlayWrapper = styled.div`
  background-color: #fafafaaa;
  width: 100%;
  height: 100%;
  position: absolute;
`

const PolkaWrapper = styled.div`
  background-image: radial-gradient(#333333 20%, transparent 20%),
      radial-gradient(#333333 20%, transparent 20%);
  background-position: 0 0, 5px 5px;
  background-size: 10px 10px;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 4em;
  top: 5em;
`

const TextWrapper = styled.div`
  position: absolute;
  left: 0;
  background: white;
  color: #333;
  bottom: 2em;
  padding: 1em 2em;
`

export const polka = () => {
  return <ImageWrapper>
    <OverlayWrapper/>

    <PolkaWrapper/>

    <TextWrapper>
      <Text.Header>This is a piece of text</Text.Header>

      <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam.</Text>
    </TextWrapper>
  </ImageWrapper>
};