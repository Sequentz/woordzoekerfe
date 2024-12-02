import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";

const WheelComponent = ({ themes, onSelect }) => {
  const [spinning, setSpinning] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const themeData = themes.map((theme) => ({
    option: theme.theme,
    id: theme.id,
  }));

  const handleClickWheel = () => {
    if (!spinning && themes.length > 0) {
      const randomIndex = Math.floor(Math.random() * themes.length);
      setPrizeNumber(randomIndex);
      setSpinning(true);
    }
  };

  const handleStopSpinning = () => {
    setSpinning(false);
    const selectedTheme = themes[prizeNumber];
    console.log("Geselecteerd thema:", selectedTheme);
    if (selectedTheme) {
      onSelect(selectedTheme);
    }
  };

  return (
    <div className="rad">
      <h2 className="spintitel">Draai aan het rad!</h2>
      <div className="wiel">
        <div className="wiel-container" onClick={handleClickWheel}>
          <Wheel
            mustStartSpinning={spinning}
            prizeNumber={prizeNumber}
            data={themeData}
            onStopSpinning={handleStopSpinning}
            t
            backgroundColors={["#3e3e3e", "#df3428"]}
            textColors={["#ffffff"]}
            spinDuration={0.2}
            className="wheel"
          />
        </div>
      </div>
    </div>
  );
};

export default WheelComponent;
