import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link } from "@nextui-org/react";

const App: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [showMusicInput, setShowMusicInput] = useState(false);
  const [name, setName] = useState("");
  const [musicInfo, setMusicInfo] = useState("");

  const handleCheckboxChange = () => {
    setShowMusicInput(!showMusicInput);
  };

  const handleSubmit = () => {
    // Dados a serem enviados
    const dataToSend = { name, musicInfo };
    console.log("Enviando dados:", dataToSend);

    // Código para enviar para a API
    // fetch('API_URL', { method: 'POST', body: JSON.stringify(dataToSend) });

    // Limpar os campos após o envio
    setName("");
    setMusicInfo("");
    setShowMusicInput(false);

    onOpenChange(); // Fechar o modal após o envio
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">Open Modal</Button>
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
                    value={musicInfo}
                    onChange={(e) => setMusicInfo(e.target.value)}
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
