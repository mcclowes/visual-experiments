import React from "react";
import { 
  MothAbdomen,
  MothLower,
  MothUpper,
  MothWrapper,
} from "./csx";

const Moth = props => {
  const { color, type='default' } = props;

  return <MothWrapper type={type} color={color}>
    <MothUpper type={type}/>
    <MothUpper type={type}/>
    <MothLower type={type}/>
    <MothLower type={type}/>
    <MothAbdomen type={type}/>
  </MothWrapper>;
};

export default Moth;
