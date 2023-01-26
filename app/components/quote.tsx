import { useEffect, useState } from "react";
import { Placeholder } from "semantic-ui-react";

interface Quotation {
  hitokoto: string,
  from: string
}

export default function Quote() {
  const [quote, setQuote] = useState<Quotation | null>(null);

  useEffect(() => {
    fetch("https://v1.hitokoto.cn/?c=a").then(data => data.json()).then((data: Quotation) => {
      setQuote(data);
    });
  }, []);

  return quote ?
    (<>
      {quote.hitokoto}

      <div className="text-gray-600 text-sm mt-3.5 text-right">——{quote.from}</div>
    </>)
    :
    (<Placeholder>
      <Placeholder.Line />
      <Placeholder.Line />
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder>);
}