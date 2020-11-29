import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { v4 as uuid } from "uuid";
import uploadFile from "../helpers/awsS3Handler"
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import { useAppContext } from "../helpers/contextLib";

export default function FormDialog(props) {
  const { isAdmin, userAttributes } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const [filename, setFilename] = React.useState('');
  const [file, setFile] = React.useState('');
  const [articlename, setName] = React.useState('');
  const [year, setYear] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [postState, setPostState] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPostState(false);
  };

  const submit = () => {
    if (!isAdmin) {
      return false;
    }

    const fileId = uuid();
    let data = {
      articlename,
      year,
      tags,
      fileId,
      addedby: userAttributes.username
    }

    setPostState('Uploading file to S3...')
    
    uploadFile(file, fileId).then(() => {
      setPostState('Sending metadata...')

      fetch(`${process.env.REACT_APP_ARTICLE_API}items`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      .then(response => response)
      .then(data => {
        setPostState('Done!')
        props.getData()
      })
      .catch(error => {
          console.error(error)
      })
    });
    
  };

  const addfile = (e) => {
    setFilename(e.target.files[0].name)
    setFile(e.target.files[0])
  };

  const onchangeName = (e) => {
    setName(e.target.value)
  };

  const onchangeYear = (e) => {
    setYear(e.target.value)
  };

  return (
    <form>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          Add Article
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Article</DialogTitle>
          <DialogContent>
            <div style={{ display: (postState === false ? 'block' : 'none') }}>
              <DialogContentText>
                  Select an article to upload and enter applicable metadata and Tags
              </DialogContentText>
              <input
                  accept="application/pdf"
                  id="contained-button-file"
                  className='no-display'
                  type="file"
                  onChange={addfile}
                  required
                  />
              <label htmlFor="contained-button-file">
                  <Button variant="contained" color="primary" component="span">
                      Select File
                  </Button>
              </label>
              <label htmlFor="contained-button-file" className='upload-label'>{filename}</label>
              <TextField
                  autoFocus
                  margin="dense"
                  id="filename"
                  label="Article Name"
                  type="text"
                  value={articlename}
                  onChange={onchangeName}
                  fullWidth
                  required
              />
              <TextField
                  autoFocus
                  margin="dense"
                  id="year"
                  label="Year of Publication"
                  type="number"
                  value={year}
                  onChange={onchangeYear}
                  fullWidth
                  required
              />
              <TagsInput value={tags} onChange={setTags} />
          </div>
          <div style={{ display: (postState !== false ? 'block' : 'none') }}>
            <DialogContentText>
              <label>Upload Status: {postState}</label>
            </DialogContentText>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ display: (postState === false ? 'block' : 'none') }} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={submit} 
            style={{ display: (postState === false ? 'block' : 'none') }} 
            disabled={articlename === '' || year === '' || file === '' || tags.length === 0} 
            color="primary">
            Submit
          </Button>
          <Button onClick={handleClose} style={{ display: (postState !== false ? 'block' : 'none') }} disabled={!postState === 'Done!'} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}
