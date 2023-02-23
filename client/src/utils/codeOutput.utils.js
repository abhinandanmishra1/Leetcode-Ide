export const getOutput = (output) => {
  let statusId = output?.status?.id;

  if (statusId === 6) {
    return (
      <pre className="px-2 py-1 font-normal text-sm text-red-500">
        {atob(output?.compile_output)}
      </pre>
    );
  } else if (statusId === 3) {
    console.log("finished",output.time)
    return (
      <>
      {output && <span className="text-[#5cb85c] font-mono text-sm px-2">Finised in {parseInt(output.time*100)} ms </span> }
      <pre className="px-2 py-2 font-mono text-sm ">
        {atob(output.stdout) !== null
          ? `${atob(output.stdout)}`
          : null}
      </pre>
      </>
    );
  } else if (statusId === 5) {
    return (
      <pre className="px-2 py-1 font-normal text-sm text-red-500">
        {`Time Limit Exceeded`}
      </pre>
    );
  } else {
    return (
      <pre className="px-2 py-1 font-normal text-sm text-red-500">
        {atob(output?.stderr)}
      </pre>
    );
  }
};

export const statusColor = {
  Running : '#0088cc',
  
};
