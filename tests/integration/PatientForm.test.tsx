import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatientForm } from '@/components/PatientForm'

describe('PatientForm', () => {
  it('renders name input and all test checkboxes', () => {
    render(<PatientForm onAdd={vi.fn()} />)
    expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/CBC/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ESR/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ABG/i)).toBeInTheDocument()
  })

  it('shows validation error when name is empty and Add clicked', async () => {
    render(<PatientForm onAdd={vi.fn()} />)
    fireEvent.click(screen.getByText(/add to queue/i))
    expect(await screen.findByText(/patient name is required/i)).toBeInTheDocument()
  })

  it('shows validation error when no tests selected', async () => {
    render(<PatientForm onAdd={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/patient name/i), 'Rahul')
    fireEvent.click(screen.getByText(/add to queue/i))
    expect(await screen.findByText(/select at least one test/i)).toBeInTheDocument()
  })

  it('calls onAdd with correct data when form is valid', async () => {
    const onAdd = vi.fn()
    render(<PatientForm onAdd={onAdd} />)
    await userEvent.type(screen.getByLabelText(/patient name/i), 'Rahul Mehta')
    await userEvent.click(screen.getByLabelText(/CBC — Complete Blood Count/i))
    fireEvent.click(screen.getByText(/add to queue/i))
    expect(onAdd).toHaveBeenCalledWith('Rahul Mehta', ['CBC'])
  })

  it('resets form after successful submission', async () => {
    render(<PatientForm onAdd={vi.fn()} />)
    const nameInput = screen.getByLabelText(/patient name/i)
    await userEvent.type(nameInput, 'Test Patient')
    await userEvent.click(screen.getByLabelText(/CBC — Complete Blood Count/i))
    fireEvent.click(screen.getByText(/add to queue/i))
    expect(nameInput).toHaveValue('')
  })

  it('Select All button checks all tests', async () => {
    render(<PatientForm onAdd={vi.fn()} />)
    fireEvent.click(screen.getByText('All'))
    expect(screen.getByText(/14 PDFs/i)).toBeInTheDocument()
  })

  it('None button unchecks all tests', async () => {
    render(<PatientForm onAdd={vi.fn()} />)
    fireEvent.click(screen.getByText('All'))
    fireEvent.click(screen.getByText('None'))
    expect(screen.queryByText(/PDFs/i)).not.toBeInTheDocument()
  })
})
