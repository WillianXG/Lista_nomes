import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input } from "@nextui-org/react";
import { createClient } from "@supabase/supabase-js";

// Configure Supabase
const supabaseUrl = 'https://ntfnizmqhsvxthxiyfxh.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Zm5pem1xaHN2eHRoeGl5ZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3OTY4ODksImV4cCI6MjA0MDM3Mjg4OX0.m8KqtcK6ndfXTqXPahW9oWD2UQpga2E3fR2a5aTegvg'; // Replace with your Supabase key
const supabase = createClient(supabaseUrl, supabaseKey);

const App: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [showMusicInput, setShowMusicInput] = useState(false);
  const [name, setName] = useState("");
  const [music, setMusic] = useState("");

  const handleCheckboxChange = () => {
    setShowMusicInput(!showMusicInput);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    // Capture the current date and time
    const currentDate = new Date();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const dateTime = `${currentDate.toISOString().split('T')[0]} ${hours}:${minutes}:${seconds}`;

    // Data to send
    const dataToSend: { name: string; music?: string; date: string } = { 
      name, 
      date: dateTime 
    };

    if (music) {
      dataToSend.music = music;
    }

    console.log("Enviando dados:", dataToSend);

    try {
      const { error } = await supabase
        .from('test_table') // Replace with your table name
        .insert([dataToSend]);

      if (error) {
        console.error("Erro ao enviar dados:", error);
      } else {
        console.log("Dados enviados com sucesso!");
        // Optionally, you can reload the page or refresh data here
        // window.location.reload(); // Use this if you need to reload the entire page
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }

    // Clear fields after submission
    setName("");
    setMusic("");
    setShowMusicInput(false);

    onOpenChange(); // Close the modal after submission
  };

  return (
    <>
      <Button className="w-30/12" onPress={onOpen} color="primary">Novo Cantor</Button>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Preencher Dados</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Nome"
                  placeholder="Digite o nome"
                  variant="bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Checkbox
                  classNames={{
                    label: "text-small",
                  }}
                  isSelected={showMusicInput}
                  onChange={handleCheckboxChange}
                >
                  Sabe o número da música?
                </Checkbox>
                {showMusicInput && (
                  <Input
                    label="Número ou Nome da Música"
                    placeholder="Digite o número ou nome da música"
                    variant="bordered"
                    value={music}
                    onChange={(e) => setMusic(e.target.value)}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Fechar
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Enviar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default App;
