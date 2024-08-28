import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image } from "@nextui-org/react";
import { supabase } from "@/lib/supabaseClient"; // Ajuste o caminho conforme necessário

export default function CardList() {
  const [data, setData] = useState<{ name: string; cantou: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('test_table') // Substitua pelo nome da sua tabela
        .select('name, cantou, date');

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
        <div className="flex flex-col">
          <p className="text-md">Lista</p>
          <p className="text-small text-default-500">Blitz Videoke</p>
        </div>
      </CardHeader>
      <Divider/>
      <CardBody>
        {data.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <ul>
            {data.map((item, index) => (
              <li key={index} className="mb-2">
                <strong>{item.name}</strong> - {item.cantou} - {item.date}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
      <Divider/>
      <CardFooter>
        <Link
          isExternal
          showAnchorIcon
          href="https://github.com/nextui-org/nextui"
        >
          Visit source code on GitHub.
        </Link>
      </CardFooter>
    </Card>
  );
}
