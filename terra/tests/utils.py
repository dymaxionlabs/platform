def undecorated_func(f: callable):
    """
    Receives a decorated function and returns undecorated one.
    """
    return f.__closure__[0].cell_contents
