import Debug from 'debug';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { HashLoader } from 'react-spinners';
import classNames from 'classnames';
import Select, { components } from 'react-select';
import TimeAgo from 'react-timeago';
import { RiInformationLine } from 'react-icons/ri';
import ReactTooltip from 'react-tooltip';
import { FaSearch } from 'react-icons/fa';
import { BiCloudUpload, BiPlayCircle } from 'react-icons/bi';
import { getWorkerpools, getUsageByWorkerpool } from './gql';

const debug = Debug('Page');
const defaultOptions = [];
const timeframe = 7;
const fromTimestamp = Math.round(
  new Date().setDate(new Date().getDate() - 7) / 1000,
);
debug('fromDate', new Date(fromTimestamp * 1000));

const theme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#fcd15a',
    primary75: '#fcda79',
    primary50: '#fadd8e',
    primary25: '#fce5a4',
  },
});

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#5C5C60' : '#31313d',
  }),
  control: (provided) => ({
    ...provided,
    backgroundColor: '#1d1d24',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    cursor: 'pointer',
    '&:hover': {
      color: '#fcd15a',
    },
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    cursor: 'pointer',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: '#5d5d69',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#31313d',
    marginTop: '1px',
    '& *': {
      cursor: 'pointer',
    },
    boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.75)',
    borderRadius: '4px',
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
    cursor: 'pointer',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#5d5d69',
    color: 'white',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '120%',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#fcd15a',
      color: 'white',
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: 'white',
  }),
};

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          className="input-checkbox"
        />{' '}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

const round = (value, precision) => {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

const MultiValue = (props) => (
  <components.MultiValue {...props}>
    <span> {props.data.label.slice(0, 6)}...</span>
  </components.MultiValue>
);

const Control = ({ children, ...props }) => (
  <components.Control {...props}>
    <FaSearch className="search-icon" /> {children}
  </components.Control>
);

const Page = () => {
  const [wpSelection, setWPSelection] = useState([]);
  const [tooltip, showTooltip] = useState(true);

  const { loading, error, data } = useQuery(getWorkerpools, {
    onCompleted: debug,
    notifyOnNetworkStatusChange: true,
  });

  const {
    loading: usageLoading,
    error: usageError,
    data: usageData,
  } = useQuery(getUsageByWorkerpool, {
    variables: {
      timestamp: fromTimestamp,
    },
    onCompleted: debug,
    notifyOnNetworkStatusChange: true,
  });

  if (error)
    return <div className="page">Graphql Request Error: {error.message}</div>;
  if (usageError)
    return (
      <div className="page">Graphql Request Error: {usageError.message}</div>
    );

  const options =
    data?.workerpools?.length > 0
      ? data.workerpools.map((e) => ({ value: e.id, label: e.id }))
      : defaultOptions;

  debug('wpSelection', wpSelection);
  const workerpools = loading
    ? []
    : data.workerpools.filter((wp) => {
        if (wpSelection.length === 0) return true;
        return wpSelection.includes(wp.id);
      });

  debug('workerpools', workerpools);

  const owners = new Set(workerpools.map((wp) => wp.owner.id));

  const fullWps =
    usageData?.workerpools
      .filter((wp) => workerpools.map((wpool) => wpool.id).includes(wp.id))
      .sort((a, b) => b.usages.length - a.usages.length) || [];
  debug('fullWps', fullWps);
  debug('fullWps[0]', fullWps[0]);
  debug('fullWps.length', fullWps.length);

  const allDeals = fullWps.reduce(
    (accu, current) =>
      accu.concat(
        current.usages.map((deal) => ({ ...deal, workerpoolID: current.id })),
      ),
    [],
  );
  debug('allDeals[0]', allDeals[0]);
  const allWpPrices = allDeals.map((deal) => deal.workerpoolPrice);
  const totalWpPrice = allWpPrices.reduce(
    (accu, current) => accu + Number.parseFloat(current),
    0,
  );
  debug('totalWpPrice', totalWpPrice);
  const avgWpPrice = totalWpPrice / (allWpPrices.length || 1);

  const allTasks = allDeals
    .reduce(
      (accu, current) =>
        accu.concat(
          current.tasks.map((task) => ({
            ...task,
            workerpoolID: current.workerpoolID,
          })),
        ),
      [],
    )
    .sort((a, b) => b.timestamp - a.timestamp);
  debug('allTasks', allTasks);

  debug('allTasks[0]', allTasks[0]);
  debug('allTasks.length', allTasks.length);

  const completedTasks = allTasks.filter((task) => task.status === 'COMPLETED');
  debug('completedTasks.length', completedTasks.length);

  const completionRate = completedTasks.length / (allTasks.length || 1);
  debug('completionRate', completionRate);

  const processingTimes = completedTasks.map(
    (task) =>
      Number.parseInt(task.timestamp, 10) -
      Number.parseInt(task.events[0].timestamp, 10),
  );
  debug('processingTimes', processingTimes);

  const totalProcessingTime = processingTimes.reduce(
    (accu, current) => accu + current,
    0,
  );
  debug('totalProcessingTime', totalProcessingTime);
  const avgProcessingTime = totalProcessingTime / (processingTimes.length || 1);
  debug('avgProcessingTime', avgProcessingTime);

  const shortestProcessingTime =
    processingTimes.length > 0 ? Math.min(...processingTimes) : 0;
  const longestProcessingTime =
    processingTimes.length > 0 ? Math.max(...processingTimes) : 0;

  return (
    <div className="page">
      {tooltip && <ReactTooltip effect="solid" type="light" />}
      <div className="page-container">
        <div className="section">
          <div className="section-title">
            <div>
              {loading ? (
                <HashLoader size={25} sizeunit={'rem'} color={'white'} />
              ) : (
                workerpools.length
              )}
              &nbsp;Workerpool{workerpools.length > 1 ? 's' : ''}
            </div>
          </div>
          <div className="selector">
            <Select
              styles={customStyles}
              options={options}
              isMulti={true}
              isSearchable={true}
              placeholder={'Filter Workerpools'}
              theme={theme}
              // menuIsOpen={true}
              value={wpSelection.map((wp) => ({ value: wp, label: wp }))}
              components={{
                Control,
                Option,
                MultiValue,
              }}
              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              noOptionsMessage={() =>
                loading
                  ? 'Loading workerpools'
                  : 'No Workerpool or Workerpool not found'
              }
              isLoading={loading}
              onChange={(e) => {
                debug(e);
                setWPSelection(e.map((wp) => wp.value));
              }}
            />
          </div>
        </div>
        <div className="cards">
          <div className="card a">
            <p
              className="metric-label"
              data-tip="TVL in PoCo"
              onMouseEnter={() => showTooltip(true)}
              onMouseLeave={() => {
                showTooltip(false);
                setTimeout(() => showTooltip(true), 50);
              }}
            >
              Locked
              <RiInformationLine className="information-icon" />
            </p>
            <div className="metric-value">
              {loading ? (
                <HashLoader size={18} sizeunit={'rem'} color={'white'} />
              ) : (
                workerpools
                  .reduce(
                    (accu, current) =>
                      accu + Number.parseFloat(current?.owner?.balance || 0),
                    0,
                  )
                  .toFixed(2)
              )}
              &nbsp;RLC
            </div>
            <p className="metric-timing">at this time</p>
          </div>
          <div className="card b">
            <p className="metric-label">Processed</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                allTasks.length
              )}
              &nbsp;Task{allTasks.length > 1 ? 's' : ''}
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card c">
            <p className="metric-label">Averaged</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                round(avgProcessingTime / 60, 1)
              )}
              &nbsp;min/Task
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card d">
            <p className="metric-label">Earned</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                round(totalWpPrice, 2)
              )}
              &nbsp;RLC
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card e">
            <p className="metric-label">Frozen</p>
            <div className="metric-value">
              {loading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                workerpools
                  .reduce(
                    (accu, current) =>
                      accu + Number.parseFloat(current?.owner?.frozen || 0),
                    0,
                  )
                  .toFixed(2)
              )}
              &nbsp;RLC
            </div>
            <p className="metric-timing">at this time</p>
          </div>
          <div className="card f">
            <p className="metric-label">Most Active WP</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                <a onClick={() => setWPSelection([fullWps[0].id])}>
                  {fullWps[0].id.slice(0, 5).concat('...')}
                </a>
              )}
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card h">
            <p className="metric-label">Shortest Task</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                round(shortestProcessingTime / 60, 1)
              )}
              &nbsp;min
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card l">
            <p className="metric-label">Longest Task</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                round(longestProcessingTime / 60, 1)
              )}
              &nbsp;min
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card i">
            <div className="metric-label">Latest Activity</div>
            <div className="table">
              <div className="row head">
                <div className="first column">Time</div>
                <div className="second column">Task</div>
                <div className="third column">Worker Pool</div>
                <div className="fourth column">Status</div>
              </div>
              {loading || usageLoading ? (
                <div className="row data last empty">
                  <HashLoader
                    className="hashloader"
                    size={18}
                    sizeunit={'rem'}
                    color={'white'}
                  />
                </div>
              ) : allTasks.slice(0, 5).length > 0 ? (
                allTasks.slice(0, 5).map((task, index, tasks) => (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://explorer.iex.ec/bellecour/task/${task.id}`}
                    key={task.id}
                  >
                    <div
                      className={classNames('row', 'data', {
                        last: index === tasks.length - 1,
                      })}
                    >
                      <div className="first column">
                        <p>
                          <TimeAgo
                            date={
                              new Date(
                                Number.parseInt(task.timestamp, 10) * 1000,
                              )
                            }
                          />
                        </p>
                      </div>

                      <div className="second column">
                        <p>{task.id}</p>
                      </div>
                      <div className="third column">
                        <p>{task.workerpoolID}</p>
                      </div>
                      <div className="fourth column">
                        <p>{task.status}</p>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="row data last empty">
                  No activity in the last {timeframe} days for the selected
                  workerpools
                </div>
              )}
            </div>
            <a
              className="metric-timing"
              target="_blank"
              rel="noopener noreferrer"
              href="https://explorer.iex.ec"
            >
              see more
            </a>
          </div>
          <div className="card j">
            <p className="metric-label">Completed</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                round(completionRate * 100, 1)
              )}
              % of Tasks
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card k">
            <p className="metric-label">Averaged</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                round(avgWpPrice, 4)
              )}
              &nbsp;RLC/Task
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card g">
            <p className="metric-label">Computed</p>
            <div className="metric-value">
              {loading || usageLoading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                round(totalProcessingTime / 3600, 0)
              )}
              &nbsp;hour{totalProcessingTime > 1 ? 's' : ''}
            </div>
            <p className="metric-timing">in the last {timeframe} days</p>
          </div>
          <div className="card m">
            <p className="metric-label">Controlled By</p>
            <div className="metric-value">
              {loading ? (
                <HashLoader
                  className="hashloader"
                  size={18}
                  sizeunit={'rem'}
                  color={'white'}
                />
              ) : (
                owners.size
              )}
              &nbsp;Manager{owners.size > 1 ? 's' : ''}
            </div>
            <p className="metric-timing">at this time</p>
          </div>
        </div>
        <div className="play-section">
          <div className="play-text">Play with iExec</div>
          <div className="play-buttons">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.iex.ec/for-workers/manage-a-pool-of-workers"
              className="play-button"
            >
              Deploy <BiCloudUpload className="play-icon" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://market.iex.ec/"
              className="play-button"
            >
              Run a Task <BiPlayCircle className="play-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
