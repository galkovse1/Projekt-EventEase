import { useAuth0 } from '@auth0/auth0-react';

export const Login = (): JSX.Element => {
  const { loginWithPopup } = useAuth0();

  return (
    <div className="relative w-full h-screen bg-zinc-900/90">
      <img
        loading="lazy"
        className="absolute w-full h-full object-cover"
        src="https://res.cloudinary.com/dukuzakaw/image/upload/v1669417452/plannerApp/loginImage/login_image_tipn8h.webp"
        alt="Planner APP Background"
      />
      <div className="flex justify-center items-center h-full relative">
        <div className="max-w-[800px] mx-auto bg-white p-8 rounded-md">
          <h2 className="text-5xl font-bold py-4">Plan your next event with friends and family with ease.</h2>
          <div className="flex justify-center">
            <button
              onClick={() => void loginWithPopup()}
              type="button"
              className="relative bg-[#6b705c] hover:bg-[#a5a58d] rounded-md py-2 px-6 text-white text-2xl"
            >
              Join us
            </button>
          </div>
          <p className="font-semibold text-[18px] mt-6">Never forget an event or what to bring!</p>
        </div>
      </div>
    </div>
  );
};
