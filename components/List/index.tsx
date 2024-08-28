import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image } from "@nextui-org/react";
import { supabase } from "../../lib/supabaseClient"; // Ajuste o caminho conforme necessário

type Item = {
  id: number;
  name: string;
  cantando: boolean;
  music: string;
  order_position: number;
};

export default function CardList() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCantandoId, setCurrentCantandoId] = useState<number | null>(null);
  const [showWaitingMessage, setShowWaitingMessage] = useState(false);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .select('id, name, cantando, music, order_position')
      .order('order_position', { ascending: true });

    if (error) {
      console.error("Erro ao buscar dados:", error);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const handleTransparentBallClick = async (id: number) => {
    if (currentCantandoId !== null && currentCantandoId !== id) {
      setShowWaitingMessage(true);
      return;
    }

    // Atualizar o banco de dados para iniciar a pessoa cantando
    await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .update({ cantando: true })
      .eq('id', id);

    // Atualizar o estado local
    setData(prevData => {
      const updatedData = prevData.map(item =>
        item.id === id ? { ...item, cantando: true } : item
      );
      return updatedData.sort((a, b) => a.order_position - b.order_position);
    });

    setCurrentCantandoId(id);
    setShowWaitingMessage(false);
  };

  const handleRedBallClick = async (id: number) => {
    if (currentCantandoId !== null && currentCantandoId !== id) {
      setShowWaitingMessage(true);
      return;
    }

    const maxOrderPosition = Math.max(...data.map(item => item.order_position), 0);
    const updatedOrderPosition = maxOrderPosition + 1;

    await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .update({ cantando: false, order_position: updatedOrderPosition })
      .eq('id', id);

    setData(prevData => {
      const updatedData = prevData.map(item =>
        item.id === id ? { ...item, cantando: false, order_position: updatedOrderPosition } : item
      );
      return updatedData.sort((a, b) => a.order_position - b.order_position);
    });

    setShowWaitingMessage(false);
    setCurrentCantandoId(null);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'test_table' },
        (payload) => {
          console.log('Novo registro adicionado:', payload.new);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <p className="text-lg">Carregando...</p>;

  const upcoming = data.find(item => !item.cantando);
  const upcomingName = upcoming ? upcoming.name : "Ninguém";
  const totalPeople = data.length;

  return (
    <Card className="w-full max-w-[750px] h-[500px] max-h-[calc(300vh-300px)] mb-5 overflow-hidden mx-4 sm:mx-6">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            alt="nextui logo"
            height={40}
            radius="sm"
            src="/blitz.ico"
            width={40}
          />
          <div className="flex justify-between items-center w-full">
            <p className="text-xl">Lista</p>
            <p className="text-xl">|</p>
            <p className="text-xl">Total de pessoas: ({totalPeople})</p>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {data.length === 0 ? (
          <p className="text-xl self-center">Lista Vazia</p>
        ) : (
          <ul>
            {data.map((item: Item) => (
              <button
                key={item.id}
                className={`flex items-center mb-2 justify-between text-lg ${item.cantando ? '' : ''}`}
                style={{ backgroundColor: 'transparent', border: 'none', padding: '10px', width: '100%', textAlign: 'left' }}
                onClick={() => item.cantando ? handleRedBallClick(item.id) : handleTransparentBallClick(item.id)}
              >
                <span>{item.name} - <span className="text-blue-500">{item.music || "Não informado"}</span></span>
                <div
                  className={`w-4 h-4 border-2 rounded-full ${item.cantando ? 'bg-red-600' : 'border-gray-600'}`}
                />
              </button>
            ))}
          </ul>
        )}
        {showWaitingMessage && (
          <p className="text-red-500 text-center mt-4">Espere a pessoa parar de cantar antes de escolher outra.</p>
        )}
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-between items-center">
        <p className="text-lg">Próximo a cantar: <strong>{upcomingName}</strong></p>
      </CardFooter>
    </Card>
  );
}
