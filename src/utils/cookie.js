const config = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
}
export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {...config,maxAge:1000*60*60*24*30});
}

export const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refreshToken', config);
}