import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image, Checkbox, Button } from "@nextui-org/react"; 
import { supabase } from "../../lib/supabaseClient"; // Ajuste o caminho conforme necessário

export default function CardList() {
  const [data, setData] = useState<{ id: number; name: string; cantou: boolean; music: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [clicks, setClicks] = useState(0); // Track number of clicks
  const [lastClickTime, setLastClickTime] = useState<number | null>(null); // Track the time of the last click

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .select('id, name, cantou, music')
      .order('date', { ascending: true }); // Ordena por data do mais antigo ao mais recente

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const handleCheckboxChange = async (id: number, checked: boolean) => {
    if (checked) {
      const { error } = await supabase
        .from('test_table') // Substitua pelo nome da sua tabela
        .update({ cantou: true })
        .eq('id', id);

      if (error) {
        console.error("Error updating data:", error);
      } else {
        fetchData(); // Recarregar os dados após a atualização
      }
    }
  };

  const handleReset = async () => {
    const now = Date.now();
    if (lastClickTime && now - lastClickTime < 3000) {
      setClicks(clicks + 1);
    } else {
      setClicks(1);
    }
    setLastClickTime(now);

    if (clicks >= 1) {
      if (clicks >= 2) {
        const { error } = await supabase
          .from('test_table') // Substitua pelo nome da sua tabela
          .update({ cantou: false })
          .neq('cantou', false); // Adiciona uma condição para garantir que a atualização só afete as linhas que precisam ser alteradas

        if (error) {
          console.error("Error resetting data:", error);
        } else {
          fetchData(); // Recarregar os dados após a atualização
        }
      }
    }
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

  if (loading) return <p className="text-lg">Loading...</p>;

  const upcoming = data.find(item => !item.cantou);
  const upcomingName = upcoming ? upcoming.name : "Ninguém";
  const totalPeople = data.length;

  return (
    <Card className="w-[750px] h-[500px] overflow-hidden">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            alt="nextui logo"
            height={40}
            radius="sm"
            src="/blitz.ico"
            width={40}
          />
          <div className="flex flex-col">
            <p className="text-xl">Lista ({totalPeople})</p>
            <p className="text-lg text-default-500">Blitz Videoke</p>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {data.length === 0 ? (
          <p className="text-lg">No data available.</p>
        ) : (
          <ul>
            {data.map((item) => (
              <li key={item.id} className="flex items-center mb-2 justify-between text-lg">
                <span>{item.name} - {item.music || "não informado"}</span>
                <Checkbox
                  checked={item.cantou}
                  onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                  color="primary"
                  className={`custom-checkbox ${item.cantou ? 'checked' : ''}`}
                  isDisabled={item.cantou} // Desativa a checkbox se `cantou` for true
                />
              </li>
            ))}
          </ul>
        )}
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-between items-center">
        <p className="text-lg">Próximo a cantar: <strong>{upcomingName}</strong></p>
        <Button
          onClick={handleReset}
          className="reset-button text-lg"
          style={{ marginLeft: 'auto' }} // Push button to the right
        >
          Nova Rodada
        </Button>
      </CardFooter>
    </Card>
  );
}
