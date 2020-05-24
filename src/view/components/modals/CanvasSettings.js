import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'components/interface/Button';
import { Settings, Setting } from 'components/editing';
import Layout from 'components/layout/Layout';
import ButtonRow from 'components/layout/ButtonRow';
import { updateCanvas } from 'actions/stage';

export default function CanvasSettings({ onClose }) {
  const dispatch = useDispatch();
  const stageConfig = useSelector(({ stage }) => stage);
  const [state, setState] = useState(stageConfig);
  const { width, height, backgroundColor } = state;

  function handleChange(props) {
    setState({ ...state, ...props });
  }

  function handleCancel() {
    onClose();
  }

  async function handleSave() {
    await dispatch(updateCanvas(width, height, backgroundColor));
    onClose();
  }

  return (
    <Layout width={500}>
      <Settings onChange={handleChange}>
        <Setting
          label="Width"
          type="number"
          name="width"
          value={width}
          min={240}
          max={1920}
          step={2}
        />
        <Setting
          label="Height"
          type="number"
          name="height"
          value={height}
          min={240}
          max={1080}
          step={2}
        />
        <Setting
          label="Background Color"
          type="color"
          name="backgroundColor"
          value={backgroundColor}
        />
      </Settings>
      <ButtonRow>
        <Button onClick={handleSave} text="OK" />
        <Button onClick={handleCancel} text="Cancel" />
      </ButtonRow>
    </Layout>
  );
}
