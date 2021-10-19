interface ArgvConfig {
    secret?: string
    port?: number
}

const config = (): ArgvConfig => {
    const args = process.argv.slice(2)
    const parseArg = <T> (f: (s: string) => T) => (a: string) => {
        const ioa = args.indexOf(`--${a}`)
        return ioa !== -1 && (ioa + 1) < args.length ? f(args[ioa + 1]) : undefined
    }
    const parseEnv = <T> (f: (s: string | undefined) => T) => (a: string) => {
        const e = process.env
        return typeof e[a] !== "undefined" ? f(e[a]) : undefined
    }
    return {
        secret: parseEnv(x => x)('SECRET') || parseArg(x => x)('secret'),
        port: parseEnv(x => parseInt(x || "") || undefined)('PORT') || parseArg(x => parseInt(x) || undefined)('port')
    }
}

const getSecret = () => {
    const cfg = config()
    if (!cfg.secret) {
        console.log("secret is required")
        process.exit(1)
    }
    return cfg.secret as string
}

export { config, getSecret }
