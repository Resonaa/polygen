export default function CountDown() {
  const curTime = new Date(), expectedTime = new Date("2023-6-28");
  const deltaDay = Math.ceil((Number(expectedTime) - Number(curTime)) / 1000 / 86400);


  return (<>
    距离 <strong>polygen 公测</strong> 还有 <strong>{deltaDay}</strong> 天
  </>);
}