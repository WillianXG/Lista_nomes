import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://ntfnizmqhsvxthxiyfxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Zm5pem1xaHN2eHRoeGl5ZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3OTY4ODksImV4cCI6MjA0MDM3Mjg4OX0.m8KqtcK6ndfXTqXPahW9oWD2UQpga2E3fR2a5aTegvg';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const truncateTable = async () => {
    try {
      // Chama a função SQL para truncar a tabela
      const { data, error } = await supabase.rpc('truncate_table');

      if (error) {
        throw error;
      }

      alert('Tabela truncada com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao truncar tabela:', error);
      alert('Ocorreu um erro ao truncar a tabela.');
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="danger">Apagar lista</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Tem certeza que deseja apagar a lista?</ModalHeader>
              <ModalBody>
                <p>
                  Isso ira apagar todos os dados na lista.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="danger" onPress={() => { truncateTable(); onClose(); }}>
                  Apagar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
