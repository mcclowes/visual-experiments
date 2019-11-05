import styled from "styled-components/macro";

export const MothAbdomen = styled.div`
  width: 20px;
  height: 50px;
  border-radius: 50%;
  margin: auto;

  ${props=>props.type==="alt7" ? `margin-top: 20px` : '' }
`;

export const MothUpper = styled.div`
  height: 30px;
  border-radius: 50%;
  position: absolute;
  width: 100px;
  top: 27px;
  transition: 0.2s;
  
  &:nth-child(1) {
    left: 0;
    transform: rotate(-15deg);

    ${props=>props.type==="alt" ? 'border-radius: 50% 80% 50% 100%;' : ''};
    ${props=>props.type==="alt2" ? 'border-radius: 100px 300px 100px 300px;' : ''};
    ${props=>props.type==="alt3" ? 'border-radius: 1em 3em 1em 3em / 0.5em 3em 0.5em 3em;' : ''};
    ${props=>props.type==="alt4" ? 'border-radius: 50% 50% 10% 50% / 10% 50% 10% 50%;' : ''};
    ${props=>props.type==="alt5" ? 'border-radius: 50% 50% 10% 100% / 10% 50% 10% 100%;' : ''};

    ${props=>props.type==="alt6" ? `left: 7px; transform: rotate(-42deg); top: 51px;` : ''};
    ${props=>props.type==="alt7" ? 'border-radius: 50% 50% 100% 50% / 10% 50% 100% 50%; left: 28px; transform: rotate(-65deg); top: 57px;' : ''};
  }

  &:nth-child(2) {
    right: 0;
    transform: rotate(15deg);

    ${props=>props.type==="alt" ? 'border-radius: 80% 50%  100% 50%;' : ''};
    ${props=>props.type==="alt2" ? 'border-radius:300px 100px 300px 100px;' : ''};
    ${props=>props.type==="alt3" ? 'border-radius: 3em 1em 3em 1em / 3em 0.5em 3em 0.5em;' : ''};
    ${props=>props.type==="alt4" ? 'border-radius: 50% 50% 50% 10% / 50% 10% 50% 10%;' : ''};
    ${props=>props.type==="alt5" ? 'border-radius: 50% 50% 100% 10% / 50% 10% 100% 10%;' : ''};

    ${props=>props.type==="alt6" ? `right: 7px; transform: rotate(42deg); top: 51px;` : ''};
    ${props=>props.type==="alt7" ? 'border-radius: 50% 50% 50% 100%  / 50% 10% 50% 100%; right: 28px; transform: rotate(65deg); top: 57px;' : ''};
  }
`;

export const MothLower = styled.div`
  width: 50px;
  height: 30px;
  border-radius: 50%;
  position: absolute;
  top: 38px;
  transition: 0.4s;

  &:nth-child(3) {
    left: 45px;
    transform: rotate(-15deg);

    ${props=>props.type==="alt1" ? 'border-radius: 50% 80% 50% 100%;' : ''};
    ${props=>props.type==="alt2" ? 'border-radius: 100px 300px 100px 300px;' : ''};
    ${props=>props.type==="alt3" ? 'border-radius: 1em 3em 1em 3em / 0.5em 3em 0.5em 3em;' : ''};
    ${props=>props.type==="alt4" ? 'border-radius: 50% 50% 10% 50% / 10% 50% 10% 50%;' : ''};
    ${props=>props.type==="alt5" ? 'border-radius: 50% 50% 10% 100% / 10% 50% 10% 100%;' : ''};

    ${props=>props.type==="alt6" ? `left: 54px; transform: rotate(-42deg); top: 51px;` : ''};
    ${props=>props.type==="alt7" ? `left: 61px; transform: rotate(-89deg); top: 59px;` : ''};
  }

  &:nth-child(4) {
    right: 45px;
    transform: rotate(15deg);

    ${props=>props.type==="alt" ? 'border-radius: 80% 50%  100% 50%;' : ''};
    ${props=>props.type==="alt2" ? 'border-radius: 300px 100px 300px 100px;' : ''};
    ${props=>props.type==="alt3" ? 'border-radius: 3em 1em 3em 1em / 3em 0.5em 3em 0.5em;' : ''};
    ${props=>props.type==="alt4" ? 'border-radius: 50% 50% 50% 10% / 50% 10% 50% 10%;' : ''};
    ${props=>props.type==="alt5" ? 'border-radius: 50% 50% 100% 10% / 50% 10% 100% 10%;' : ''};

    ${props=>props.type==="alt6" ? `right: 54px; transform: rotate(42deg); top: 51px;` : ''};
    ${props=>props.type==="alt7" ? `right: 61px; transform: rotate(89deg); top: 59px;` : ''};
  }
`;


export const MothWrapper = styled.div`
  width: 200px;
  height: 100px;
  border-radius: 50%;
  position: relative;
  padding: 20px;
  margin: auto;

  ${MothAbdomen},
  ${MothLower},
  ${MothUpper} {
    background: ${props=>props.color};
  }

  &:hover {
    ${MothLower},
    ${MothUpper} {
      &:nth-child(1) {
        transform: rotate(-18deg);
        top: 30px;
      }

      &:nth-child(2) {
        transform: rotate(18deg);
        top: 30px;
      }

      &:nth-child(3) {
        transform: rotate(-18deg);
        top: 40px;
      }
      
      &:nth-child(4) {
        transform: rotate(18deg);
        top: 40px;
      }
    }
  }

  ${props=>props.type==="alt7" ? 'padding-top: 0; pointer-events: none;' : ''};
`;

MothWrapper.defaultProps = {
  color: 'brown'
}
