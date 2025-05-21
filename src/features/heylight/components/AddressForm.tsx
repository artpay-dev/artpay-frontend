import { useForm } from "react-hook-form";

type AddressFormInputs = {
  contact_number: string | undefined;
  address_line_1: string | undefined;
  zip_code: string | undefined;
  city: string | undefined;
};

export default function AddressForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormInputs>({
    defaultValues: {
      contact_number: "",
      address_line_1: "",
      zip_code: "",
      city: "",
    },
  });

  const onSubmit = (data: AddressFormInputs) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto space-y-3"
    >
      <p className={'leading-[125%] text-tertiary text-sm'}>Compila il form per avviare la richiesta prestito.</p>
      <div>
        <input
          {...register("contact_number", { required: true })}
          className="placeholder:text-gray-500 bg-white w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
          type="text"
          placeholder="Telefono"
        />
        {errors.contact_number && (
          <span className="text-red-500 text-xs">Campo obbligatorio</span>
        )}
      </div>


      <div>
        <input
          {...register("address_line_1", { required: true })}
          className="placeholder:text-gray-500 bg-white w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
          type="text"
          placeholder="Indirizzo"
        />
        {errors.address_line_1 && (
          <span className="text-red-500 text-xs">Campo obbligatorio</span>
        )}
      </div>

      <div>
        <input
          {...register("zip_code", { required: true })}
          className="placeholder:text-gray-500 bg-white w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
          type="text"
          placeholder="CAP"
        />
        {errors.zip_code && (
          <span className="text-red-500 text-xs">Campo obbligatorio</span>
        )}
      </div>

      <div>
        <input
          {...register("city", { required: true })}
          className="placeholder:text-gray-500 bg-white w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
          type="text"
          placeholder={"Città"}
        />
        {errors.city && (
          <span className="text-red-500 text-xs">Campo obbligatorio</span>
        )}
      </div>

      <div className={'flex justify-end'}>
        <button
          type="submit"
          className="artpay-button-style transition-all text-primary border border-primary w-fit! py-2.5!"
        >
          Salva
        </button>
      </div>
    </form>
  );
}
