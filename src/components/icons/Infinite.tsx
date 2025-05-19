export default ({ ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M9.828 9.172a4 4 0 100 5.656A10 10 0 0012 12a10 10 0 012.172-2.828 4 4 0 110 5.656A10 10 0 0112 12a10 10 0 00-2.172-2.828" />
  </svg>
)