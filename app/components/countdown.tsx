import { Fragment } from "react";

export default function CountDown() {
  const countDowns = [
    { date: "2023-6-28", description: "polygen 公测" }
  ];

  const curTime = new Date();

  return (<>
    {countDowns.map(({ date, description }) => (
      <Fragment key={description}>
        距离 <strong>{description}</strong> 还有 <strong>
        {Math.ceil((Number(new Date(date)) - Number(curTime)) / 1000 / 86400)}</strong> 天
      </Fragment>
    ))}
  </>);
}