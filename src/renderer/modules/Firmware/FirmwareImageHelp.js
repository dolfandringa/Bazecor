// -*- mode: js-jsx -*-
/* Bazecor
 * Copyright (C) 2022  Dygmalab, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Styled from "styled-components";

import { FirmwareNeuronHelp, FirmwareDefyUpdatingStatus } from "../Firmware";

import videoFirmwareUpdate from "../../../../static/videos/update-firmware.mp4";
import videoFirmwareUpdateReleaseKey from "../../../../static/videos/release-key.mp4";
import videoFirmwareUpdateDefySRC from "../../../../static/videos/update-firmware-defy-compress.mp4";
import videoFirmwareUpdateDefyReleaseSRC from "../../../../static/videos/update-firmware-defy-releaseKeys-compress.mp4";
import { IconCheckmarkSm } from "../../component/Icon";

const Style = Styled.div`   
.updatingRaise {
  margin:auto;
  align-self: center;
  justify-content: center;
}
.blob {
  background: #33d9b2;
  box-shadow: 0 0 0 0 #33d9b2;
  border-radius: 50%;
  margin: 10px;
  height: 8px;
  width: 8px;
  transform: scale(1);

  // animation: pulse-green 2s infinite;
  transform: scale(1);
  box-shadow: 0 0 0 32px rgba(51, 217, 178, 0.15);
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(51, 217, 178, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 42px rgba(51, 217, 178, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(51, 217, 178, 0);
  }
}

.processCanvas {
  position: relative;
  canvas {
    max-width: 100%; 
  }
  .status-icon {
    position: absolute;
  }
  &.processRaise .status-icon {
    top: 62px;
    left: 85px;
  }
  &.processDefy .status-icon {
    top: 73px;
    left: 72px;
  }
}
.process-raise,
.process-Raise {
  background-position: left bottom;
  background-repeat: no-repeat;
  background-image: url(${({ theme }) => theme.styles.firmwareUpdateProcess.raiseSVG});
}
.process-defy,
.process-Defy {
  background-position: left bottom;
  background-repeat: no-repeat;
  background-image: url(${({ theme }) => theme.styles.firmwareUpdateProcess.defySVG});
}
`;
/**
 * This FirmwareImageHelp function returns a video that reacts according the firmware update status
 * The object will accept the following parameters
 *
 * @param {number} countdown - Number representing the position during the update process
 * @returns {<FirmwareImageHelp>} FirmwareImageHelp component.
 */
const FirmwareImageHelp = ({
  countdown,
  deviceProduct,
  keyboardType,
  steps,
  error,
  retriesLeft,
  retriesRight,
  retriesNeuron,
  retriesDefyWired
}) => {
  const videoIntro = React.useRef(null);
  const videoIntroDefy = React.useRef(null);
  const videoReleaseDefy = React.useRef(null);
  const videoRelease = React.useRef(null);
  const checkSuccess = React.useRef(null);

  useEffect(() => {
    if (countdown == 0) {
      if (deviceProduct == "Raise") {
        videoIntro.current.addEventListener(
          "ended",
          function () {
            videoIntro.current.currentTime = 3;
            videoIntro.current.play();
          },
          false
        );
        videoRelease.current.pause();
      } else {
        videoIntroDefy.current.addEventListener(
          "ended",
          function () {
            videoIntroDefy.current.currentTime = 3;
            videoIntroDefy.current.play();
          },
          false
        );
        videoIntroDefy.current.pause();
      }
      checkSuccess.current.classList.remove("animInCheck");
    }
    if (countdown == 1) {
      if (deviceProduct == "Raise") {
        videoIntro.current.classList.add("animOut");
        videoRelease.current.classList.add("animIn");
      } else {
        videoIntroDefy.current.classList.add("animOut");
        videoReleaseDefy.current.classList.add("animIn");
      }
      checkSuccess.current.classList.remove("animInCheck");
    }
    if (countdown == 2) {
      if (deviceProduct == "Raise") {
        videoRelease.current.play();
      } else {
        videoReleaseDefy.current.play();
      }
      checkSuccess.current.classList.remove("animInCheck");
    }
    if (countdown == steps.length - 2) {
      checkSuccess.current.classList.add("animInCheck");
    }
  }, [countdown, deviceProduct]);

  return (
    <Style>
      <div className="process-row process-header">
        <div className="process-col process-image">
          <div className="videoWrapper">
            <div className="videoInner">
              <div className="firmwareCheck animWaiting" ref={checkSuccess}>
                <IconCheckmarkSm />
              </div>
              {deviceProduct == "Raise" ? (
                <>
                  <video ref={videoIntro} width={520} height={520} autoPlay={true} className="img-center img-fluid animIn">
                    <source src={videoFirmwareUpdate} type="video/mp4" />
                  </video>
                  <video
                    ref={videoRelease}
                    width={520}
                    height={520}
                    autoPlay={false}
                    className="img-center img-fluid animWaiting"
                  >
                    <source src={videoFirmwareUpdateReleaseKey} type="video/mp4" />
                  </video>
                </>
              ) : (
                <>
                  <video ref={videoIntroDefy} width={520} height={520} autoPlay={true} className="img-center img-fluid animIn">
                    <source src={videoFirmwareUpdateDefySRC} type="video/mp4" />
                  </video>
                  <video
                    ref={videoReleaseDefy}
                    width={520}
                    height={520}
                    autoPlay={false}
                    className="img-center img-fluid animWaiting"
                  >
                    <source src={videoFirmwareUpdateDefyReleaseSRC} type="video/mp4" />
                  </video>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={`process-col process-neuron ${countdown == 0 ? "process-" + deviceProduct : ""}`}>
          {countdown == 0 ? (
            <div className={`processCanvas process${deviceProduct}`}>
              <div className="status-icon">
                <div className="blob green pulse-green"></div>
              </div>
              <canvas className="" width={340} height={259}></canvas>
            </div>
          ) : (
            <div className={`${deviceProduct == "Defy" ? "updatingDefy" : ""} updatingRaise`}>
              {deviceProduct == "Defy" ? (
                <FirmwareDefyUpdatingStatus
                  countdown={countdown}
                  deviceProduct={deviceProduct}
                  keyboardType={keyboardType}
                  steps={steps}
                  error={error}
                  retriesLeft={retriesLeft}
                  retriesRight={retriesRight}
                  retriesNeuron={retriesNeuron}
                  retriesDefyWired={retriesDefyWired}
                />
              ) : (
                <FirmwareNeuronHelp
                  countdown={countdown}
                  deviceProduct={deviceProduct}
                  keyboardType={keyboardType}
                  steps={steps}
                  error={error}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Style>
  );
};

export default FirmwareImageHelp;
