import { useState, useEffect } from 'react';
import moment from 'moment';

import './Watch.css';

export const Watch = ({ time }: { time: string }): JSX.Element => {
  const [timeDifference, setTimeDifference] = useState<moment.Duration>(moment.duration(moment(time).diff(moment())));

  useEffect(() => {
    const target = moment(time);

    const timer = setInterval(() => {
      const difference = moment.duration(target.diff(moment()));
      setTimeDifference(difference);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`watch__container ${!timeDifference ? 'opacityElement' : ''}`}>
      {timeDifference && timeDifference.years() > 0 ? (
        <div className="watch__times">
          <span>{timeDifference ? timeDifference.years() : '00'}</span>
          <span>Months</span>
        </div>
      ) : null}
      {timeDifference && timeDifference.months() > 0 ? (
        <div className="watch__times">
          <span>{timeDifference ? timeDifference.months() : '00'}</span>
          <span>Month{timeDifference && timeDifference.months() > 1 ? 's' : ''}</span>
        </div>
      ) : null}
      <div className="watch__times">
        <span>{timeDifference ? timeDifference.days() : '00'}</span>
        <span>Days</span>
      </div>
      <div className="watch__times">
        <span>{timeDifference ? timeDifference.hours() : '00'}</span>
        <span>Hour{timeDifference && timeDifference.hours() > 1 ? 's' : ''}</span>
      </div>
      <div className="watch__times">
        <span>{timeDifference ? timeDifference.minutes() : '00'}</span>
        <span>Minute{timeDifference && timeDifference.minutes() > 1 ? 's' : ''}</span>
      </div>

      {timeDifference && timeDifference.years() === 0 ? (
        <div className="watch__times">
          <span>{timeDifference ? timeDifference.seconds() : '00'}</span>
          <span>Seconds</span>
        </div>
      ) : null}
    </div>
  );
};
