'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { z } from 'zod'
import styles from './Contact.module.scss'

const CHALLENGE_MESSAGE = "Hey! I want to take on the burger challenge - give me a call!"

// --- zod schema ---
const contactSchema = z.object({
  name: z.string().min(1, 'We need your name 🍔'),
  email: z.string().min(1, 'Drop your email so we can reply 📬').email('That doesn\'t look like a real email 🤔'),
  message: z.string().min(1, 'Say something! Anything 🗣️'),
  challengeAck: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // challengeAck is only required when coming from the challenge page
  // we handle this check in handleSubmit instead, since we need isFromChallenge
})

type ContactFields = z.infer<typeof contactSchema>
type ContactErrors = Partial<Record<keyof ContactFields, string>>

export default function Contact() {
  const searchParams = useSearchParams()
  const isFromChallenge = searchParams.get('from') === 'challenge'
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const [form, setForm] = useState<ContactFields>({
    name: '',
    email: '',
    message: isFromChallenge ? CHALLENGE_MESSAGE : '',
    challengeAck: false,
  })
  const [errors, setErrors] = useState<ContactErrors>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    // clear error on change
    if (errors[name as keyof ContactFields]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = contactSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: ContactErrors = {}
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof ContactFields
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    // extra check for challenge checkbox
    if (isFromChallenge && !form.challengeAck) {
      setErrors(prev => ({ ...prev, challengeAck: 'You need to confirm you\'ve read the rules' }))
      return
    }
    // all good — Step 6 will handle the submit
    setStatus('loading')
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: form.name,
          email: form.email,
          message: form.message,
          from_challenge: isFromChallenge,
        }])
      if (error) throw error
      setStatus('success')
      setForm({
        name: '',
        email: '',
        message: '',
        challengeAck: false,
      })
      setErrors({})
    } catch (err) {
      console.error(err)
      setStatus('idle')
    }
  }

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.contactContainer}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>
            GET IN TOUCH
          </h2>

          {/* form */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* name */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">NAME</label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>

            {/* email */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">EMAIL</label>
              <input
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>

            {/* message */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="message">MESSAGE</label>
              <textarea
                className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                id="message"
                name="message"
                rows={5}
                placeholder="What's on your mind?"
                value={form.message}
                onChange={handleChange}
              />
              {errors.message && <p className={styles.error}>{errors.message}</p>}
            </div>

            {/* challenge checkbox — only visible when ?from=challenge */}
            {isFromChallenge && (
              <div className={styles.checkboxField}>
                <label className={styles.checkboxLabel}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    name="challengeAck"
                    checked={form.challengeAck}
                    onChange={handleChange}
                  />
                  <span className={styles.checkboxCustom} aria-hidden="true" />
                  <span className={styles.checkboxText}>
                    I've read the challenge rules and I know what I'm getting into
                  </span>
                </label>
                {errors.challengeAck && <p className={styles.error}>{errors.challengeAck}</p>}
              </div>
            )}

            {/* submit */}
            <button className={styles.submitBtn} type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send it 🍔'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}