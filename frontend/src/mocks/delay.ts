export async function delay(ms = 350): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

