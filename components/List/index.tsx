import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image, Button } from "@nextui-org/react";
import { supabase } from "../../lib/supabaseClient"; // Ajuste o caminho conforme necessário

export default function CardList() {
  const [data, setData] = useState<{ id: number; name: string; cantou: boolean; music: string; order_position: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .select('id, name, cantou, music, order_position')
      .order('order_position', { ascending: true }); // Ordenar por order_position do menor para o maior

    if (error) {
      console.error("Erro ao buscar dados:", error);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const handleSingButtonClick = async (id: number) => {
    setHighlightedId(id);

    // Atualizar o estado local para destacar o item
    setData(prevData => prevData.map(item =>
      item.id === id ? { ...item, cantou: true } : item
    ));

    // Atualizar o banco de dados
    const { error } = await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .update({ cantou: true }) // Atualiza apenas o cantou
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  };

  const handleFinishedButtonClick = async (id: number) => {
    // Atualizar o estado local para mover o item para o final
    setData(prevData => {
      const updatedData = prevData.map(item =>
        item.id === id ? { ...item, cantou: false } : item
      );

      // Mover o item marcado para o final da lista
      const updatedItems = updatedData.filter(item => item.id !== id);
      const markedItem = updatedData.find(item => item.id === id);

      if (markedItem) {
        const newOrderedData = [...updatedItems, { ...markedItem, order_position: data.length }];
        return newOrderedData; // Retorna os dados atualizados com o item movido para o final
      }

      return updatedData;
    });

    // Atualizar o banco de dados
    const { error } = await supabase
      .from('test_table') // Substitua pelo nome da sua tabela
      .update({ order_position: data.length, cantou: false }) // Atualiza order_position e cantou
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar dados:", error);
    } else {
      // Recarregar dados da API para garantir que tudo esteja correto
      fetchData();
    }

    setHighlightedId(null);
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
          console.log('Novo registro adicionado:', payload.new);
          fetchData(); // Recarregar dados quando algo é adicionado
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Limpar o canal quando o componente for desmontado
    };
  }, []);

  if (loading) return <p className="text-lg">Carregando...</p>;

  const upcoming = data.find(item => !item.cantou);
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
            {data.map((item) => (
              <li
                key={item.id}
                className={`flex items-center mb-2 justify-between text-lg ${highlightedId === item.id ? 'bg-red-500 transition-all duration-1000' : ''}`}
                style={{ backgroundColor: highlightedId === item.id ? 'rgba(255, 0, 0, 0.3)' : 'transparent' }}
              >
                <span>{item.name} - <span className="text-blue-500">{item.music || "Não informado"}</span></span>
                {item.cantou ? (
                  <Button
                    size="sm"
                    color="success"
                    onClick={() => handleFinishedButtonClick(item.id)}
                  >
                    Acabou
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleSingButtonClick(item.id)}
                  >
                    Cantar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-between items-center">
        <p className="text-lg">Próximo a cantar: <strong>{upcomingName}</strong></p>
      </CardFooter>
    </Card>
  );
}
