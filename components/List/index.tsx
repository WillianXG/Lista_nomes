import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image, Button } from "@nextui-org/react";
import { supabase } from "../../lib/supabaseClient"; // Adjust path as needed

export default function CardList() {
  const [data, setData] = useState<{ id: number; name: string; cantou: boolean; music: string; order_position: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('test_table') // Replace with your table name
      .select('id, name, cantou, music, order_position')
      .order('order_position', { ascending: true }); // Order by order_position from smallest to largest

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const handleSingButtonClick = async (id: number) => {
    // Update local state immediately
    setData(prevData => {
      const updatedData = prevData.map(item =>
        item.id === id ? { ...item, cantou: true } : item
      );

      // Move the marked item to the end of the list
      const updatedItems = updatedData.filter(item => item.id !== id);
      const markedItem = updatedData.find(item => item.id === id);

      if (markedItem) {
        const newOrderedData = [...updatedItems, { ...markedItem, cantou: true }];
        return newOrderedData; // Return the updated data with the item moved to the end
      }

      return updatedData;
    });

    // Update the database
    const { error } = await supabase
      .from('test_table') // Replace with your table name
      .update({ cantou: true, order_position: data.length }) // Update `cantou` and `order_position`
      .eq('id', id);

    if (error) {
      console.error("Error updating data:", error);
    } else {
      // Reload data from API to ensure everything is correct
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();

    // Listener for changes in the table using Realtime
    const channel = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'test_table' },
        (payload) => {
          console.log('New record added:', payload.new);
          fetchData(); // Reload data when something is added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Cleanup the channel when component is unmounted
    };
  }, []);

  if (loading) return <p className="text-lg">Loading...</p>;

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
              <li key={item.id} className="flex items-center mb-2 justify-between text-lg">
                <span>{item.name} - <span className="text-blue-500">{item.music || "Não informado"}</span></span>
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => handleSingButtonClick(item.id)}
                >
                  Cantar
                </Button>
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
