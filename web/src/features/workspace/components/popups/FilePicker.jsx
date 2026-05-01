/**
 * FilePicker Component
 * enables to choose a file over a hidden <input type="file">-element.
 * currently the chosen file is printed out in the console
 *
 * @returns {React.JSX.Element} Button and file input for further implementations
 * @component
 */
function FilePicker() {
  return (
    <div>
      <input
        id="fileInput"
        type="file"
        className="hidden"
        onChange={(e) => console.log(e.target.files)}
      />

      <label
        htmlFor="fileInput"
        className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg"
      >
        Choose File
      </label>
    </div>
  );
}

export default FilePicker;
