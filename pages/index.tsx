
import DefaultLayout from "@/layouts/default";
import InputText from "@/components/Input";
import CardList from "@/components/List";
import BtnDrop from "@/components/BtnDrop";

export default function IndexPage() {
  return (
    <DefaultLayout>
    <CardList/>
     <InputText/>
     <div>
      <BtnDrop/>

     </div>
    </DefaultLayout>
  );
}
