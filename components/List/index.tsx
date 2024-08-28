import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image } from "@nextui-org/react";
import { supabase } from "@/lib/supabaseClient"; // Ajuste o caminho conforme necessário

export default function CardList() {
  const [data, setData] = useState<{ name: string; cantou: string; music: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .select('name, cantou, music')
      .order('date', { ascending: true }); // Ordena por data do mais antigo ao mais recente

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Listener para mudanças na tabela usando Realtime
    const channel = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'test_table' },
        (payload) => {
          console.log('New record added:', payload.new);
          fetchData(); // Recarregar os dados quando algo for adicionado
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Limpar o canal quando o componente for desmontado
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  const upcoming = data.find(item => !item.cantou);
  const upcomingName = upcoming ? upcoming.name : "Ninguém";

  return (
    <Card className="max-w-[400px] max-h-[500px] overflow-y-auto">
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
                <strong>{item.name}</strong> - {item.music || "não informado"}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
      <Divider/>
      <CardFooter>
        <p>Próximo a cantar: <strong>{upcomingName}</strong></p>
      </CardFooter>
    </Card>
  );
}
