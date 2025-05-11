
interface Props {
  exchange: Exchange
}

export default ({ exchange }: Props) => {
  return (
    <article className='p-4 grid grid-cols-[64px_1fr_max-content] items-center gap-2 border-2 border-border rounded-md bg-muted'>
      <div className='w-16 h-16 flex justify-center items-center rounded-lg border-2 border-border overflow-hidden'>
        <img
          src='https://placekitten.com/200/200'
          alt='Product image'
        />
      </div>
      <div>
        <h3 className='text-lg font-medium'>
          {exchange.product.name}
        </h3>
        <p className='text-muted-foreground'>
          {exchange.product.description}
        </p>
      </div>
      <p>
        <span className='text-muted-foreground'>
          ESTADO:
        </span>
        <br />
        {exchange.status}
      </p>
    </article>
  )
}