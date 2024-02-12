import toast from 'react-hot-toast';


const notify = (message, type) => {

  if (type == 'success') {
    toast.success(message, {
      style: {
          borderRadius: '8px',
          background: '#040015',
          color: 'white',
          border: '2px solid #4d0099',
      }
    });
  };

  if (type == 'info') {
    toast(message, {
      style: {
          borderRadius: '8px',
          background: '#040015',
          color: 'white',
          border: '2px solid #4d0099',
      }
    });
  };

}


export { notify };
