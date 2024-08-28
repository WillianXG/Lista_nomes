import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input } from "@nextui-org/react";
import { createClient } from "@supabase/supabase-js";

// Configure o Supabase
const supabaseUrl = 'https://ntfnizmqhsvxthxiyfxh.supabase.co'; // Substitua com sua URL do Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Zm5pem1xaHN2eHRoeGl5ZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3OTY4ODksImV4cCI6MjA0MDM3Mjg4OX0.m8KqtcK6ndfXTqXPahW9oWD2UQpga2E3fR2a5aTegvg'; // Substitua com sua chave pública
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
    // Captura a hora e os minutos atuais e formata corretamente
    const currentDate = new Date();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const hoursAndMinutes = `${hours}:${minutes}:00`;
    window.location.reload();

    // Dados a serem enviados
    const dataToSend: { name: string; music?: string; date: string } = { 
      name, 
      date: hoursAndMinutes 
    };

    if (music) {
      dataToSend.music = music;
    }

    console.log("Enviando dados:", dataToSend);

    try {
      const { error } = await supabase
        .from('test_table') // Substitua pelo nome da sua tabela
        .insert([dataToSend]);

      if (error) {
        console.error("Erro ao enviar dados:", error);
      } else {
        console.log("Dados enviados com sucesso!");
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }

    // Limpar os campos após o envio
    setName("");
    setMusic("");
    setShowMusicInput(false);

    onOpenChange(); // Fechar o modal após o envio
  };

  return (
    <>
      <Button className="w-2/12" onPress={onOpen} color="primary">Novo Cantor</Button>
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
}

export default App;
