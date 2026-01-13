import { Button, Typography } from "@mui/material";
import artmatchPreview from '../../../../assets/images/anteprima-artmatch.png'
import { useNavigate } from "react-router-dom";

const FeedCard = () => {
  const navigate = useNavigate();

  return (
    <div className="feed-card bg-[#1B2738] p-8 flex justify-between rounded-2xl h-full w-full max-w-xs md:max-w-none overflow-hidden">
      <div className="flex flex-col justify-between">
        <div className={'flex flex-col gap-6 '}>
          <Typography variant="display3" color={'white'}>Voglia di match?</Typography>
          <p className={'text-white text-balance text-xl leading-[125%]'}>Fai swipe tra le opere di artmatch, quando ti piace qualcosa metti like e invia una....</p>
        </div>
        <Button variant={'contained'} className={'w-fit'} onClick={() => navigate('/artmatch')}>Vai a fare swipe</Button>
      </div>
      <img src={artmatchPreview} alt="Anteprima artmatch"  className={'relative -right-16'}/>
    </div>
  );
};

export default FeedCard;